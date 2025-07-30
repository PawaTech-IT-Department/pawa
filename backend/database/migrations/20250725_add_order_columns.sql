-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER,
ADD COLUMN IF NOT EXISTS tax_cents INTEGER;

-- Update the create_order_with_items function to include the new columns
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_order_id UUID,
  p_order_time TIMESTAMPTZ,
  p_total_cost_cents INTEGER,
  p_delivery_address TEXT,
  p_payment_status VARCHAR(20),
  p_mpesa_checkout_id VARCHAR(255),
  p_payment_method VARCHAR(50),
  p_amount INTEGER,
  p_mpesa_receipt_number VARCHAR(255),
  p_transaction_date VARCHAR(20),
  p_subtotal_cents INTEGER,
  p_tax_cents INTEGER,
  p_order_items JSONB[]
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_result JSONB;
BEGIN
  -- Insert the main order with the new columns
  INSERT INTO public.orders (
    id,
    order_time,
    total_cost_cents,
    delivery_address,
    payment_status,
    mpesa_checkout_id,
    payment_method,
    amount,
    mpesa_receipt_number,
    transaction_date,
    subtotal_cents,
    tax_cents
  ) VALUES (
    p_order_id,
    p_order_time,
    p_total_cost_cents,
    p_delivery_address,
    p_payment_status,
    p_mpesa_checkout_id,
    p_payment_method,
    p_amount,
    p_mpesa_receipt_number,
    p_transaction_date,
    p_subtotal_cents,
    p_tax_cents
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOREACH v_item IN ARRAY p_order_items
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      price_at_time_of_order,
      estimated_delivery_time
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::VARCHAR(255),
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price_at_time_of_order')::INTEGER,
      (v_item->>'estimated_delivery_time')::TIMESTAMPTZ
    );
  END LOOP;

  -- Return success with order ID
  SELECT jsonb_build_object(
    'success', true,
    'order_id', v_order_id
  ) INTO v_result;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    RAISE NOTICE 'Error in create_order_with_items: %', SQLERRM;
    
    -- Return error details
    SELECT jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'sqlstate', SQLSTATE
    ) INTO v_result;
    
    RETURN v_result;
END;
$$;
