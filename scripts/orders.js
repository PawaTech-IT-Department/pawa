import { cartInstance } from '../data/cart.js';
import { getProduct } from '../data/products.js';
import formatCurrency from './utils/moneyFormatter.js';

document.addEventListener('DOMContentLoaded', async () => {
  // --- DOM Elements ---
  const deliverySection = document.getElementById('delivery-address-section');
  const paymentSection = document.getElementById('mpesa-payment-section');
  const confirmationSection = document.getElementById('final-confirmation-section');
  const addressInput = document.getElementById('delivery-address-input');
  const confirmAddressBtn = document.getElementById('confirm-address-btn');
  const phoneInput = document.getElementById('mpesa-phone-input');
  const payNowBtn = document.getElementById('pay-now-btn');
  const paymentStatusMsg = document.getElementById('payment-status-message');
  const checkPaymentBtn = document.getElementById('check-payment-status-btn');
  const finalTotalSpan = document.getElementById('final-order-total');
  const confirmOrderBtn = document.getElementById('confirm-order-btn');

  // --- State Variables ---
  let confirmedDeliveryAddress = '';
  let checkoutRequestID = '';
  let isPaymentSuccessful = false;
  let totalCents = 0;
  let pollingInterval;

  // --- Initial Load ---
  if (!cartInstance.cart || cartInstance.cart.length === 0) {
    deliverySection.innerHTML = '<h2>Your cart is empty.</h2><a href="/pages/shop.html" class="btn btn--primary">Go to Shop</a>';
    return;
  }
  
  const productPromises = cartInstance.cart.map(cartItem => getProduct(cartItem.productId).catch(() => null));
  const products = await Promise.all(productPromises);
  
  cartInstance.cart.forEach((cartItem, i) => {
    if (products[i]) {
      totalCents += products[i].priceCents * cartItem.quantity;
    }
  });
  
  deliverySection.style.display = 'block';
  paymentSection.style.display = 'none';
  confirmationSection.style.display = 'none';

  // --- Event Listeners ---
  confirmAddressBtn.addEventListener('click', () => {
    const address = addressInput.value.trim();
    if (!address) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Address',
        text: 'Please enter a delivery address.',
      });
      return;
    }
    confirmedDeliveryAddress = address;
    deliverySection.style.display = 'none';
    paymentSection.style.display = 'block';
  });

  payNowBtn.addEventListener('click', async () => {
    const phoneSuffix = phoneInput.value.trim();
    if (!/^\d{9}$/.test(phoneSuffix)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 9-digit phone number (e.g., 708032060).',
      });
      return;
    }
    const phoneNumber = `254${phoneSuffix}`;
    const amount = 1; // Using fixed 1 KES amount
    paymentStatusMsg.textContent = 'Initiating payment...';
    payNowBtn.disabled = true;
    try {
      const res = await fetch('http://localhost:5000/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, amount }),
      });
      const data = await res.json();
      console.log('STK Push Response:', data);
      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Error',
          text: data.error || 'Failed to initiate STK push.',
        });
        payNowBtn.disabled = false;
        return;
      }
      const checkoutRequestID = data.CheckoutRequestID || data.checkoutRequestID || 
                              (data.data && (data.data.CheckoutRequestID || data.data.checkoutRequestID));
      if (!checkoutRequestID) {
        console.error('No CheckoutRequestID found in response:', data);
        Swal.fire({
          icon: 'error',
          title: 'Payment Error',
          text: 'Failed to get payment reference. Please try again.',
        });
        payNowBtn.disabled = false;
        return;
      }
      console.log('Starting payment polling with CheckoutRequestID:', checkoutRequestID);
      paymentStatusMsg.textContent = 'Please enter your M-Pesa PIN on your phone.';
      startPaymentPolling(checkoutRequestID);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: err.message,
      });
      paymentStatusMsg.textContent = err.message;
      payNowBtn.disabled = false;
    }
  });

  confirmOrderBtn.addEventListener('click', async () => {
    if (!isPaymentSuccessful) {
      Swal.fire({
        icon: 'warning',
        title: 'Payment Not Confirmed',
        text: 'Payment not confirmed. Please complete payment first.',
      });
      return;
    }
    confirmOrderBtn.disabled = true;
    try {
      Swal.fire({
        title: 'Placing your order...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cartInstance.cart,
          deliveryAddress: confirmedDeliveryAddress,
          paymentStatus: 'paid',
        }),
      });
      Swal.close();
      if (!res.ok) throw new Error('Failed to finalize order.');
      cartInstance.emptyCart();
      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Your order was placed successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => {
        window.location.href = '/pages/all-orders.html';
      }, 2000);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Order Error',
        text: err.message,
      });
      confirmOrderBtn.disabled = false;
    }
  });

  // --- Functions ---
  function updatePaymentStatusUI(message, isError = false, isLoading = false) {
    const statusClass = isError ? 'error' : (isLoading ? 'loading' : 'success');
    paymentStatusMsg.innerHTML = `
      <div class="payment-status ${statusClass}">
        ${isLoading ? '<i class="fas fa-sync-alt fa-spin"></i>' : ''}
        ${isError ? '<i class="fas fa-exclamation-circle"></i>' : ''}
        ${!isLoading && !isError ? '<i class="fas fa-check-circle"></i>' : ''}
        <span>${message}</span>
      </div>
    `;
  }
  
  async function createOrder(checkoutID, mpesaReceiptNumber, transactionDate) {
    try {
      updatePaymentStatusUI('Creating your order...', false, true);
      
      // Fetch all product details first
      const products = await Promise.all(
        cartInstance.cart.map(item => getProduct(item.productId).catch(() => null))
      );

      // Calculate totals and prepare order items
      let subTotalCents = 0;
      const orderItems = [];
      
      cartInstance.cart.forEach((cartItem, index) => {
        const product = products[index];
        if (!product) {
          throw new Error(`Product not found for ID: ${cartItem.productId}`);
        }
        
        const itemTotal = product.priceCents * cartItem.quantity;
        subTotalCents += itemTotal;
        
        orderItems.push({
          productId: product.id,
          quantity: cartItem.quantity,
          priceAtTimeOfOrder: product.priceCents,
          name: product.name,
          estimatedDeliveryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        });
      });
      
      // Calculate tax and total
      const taxCents = Math.round(subTotalCents * 0.16);
      const totalCents = subTotalCents + taxCents;
      
      // Prepare order data
      const orderData = {
        cart: orderItems,
        deliveryAddress: confirmedDeliveryAddress,
        paymentStatus: 'paid',
        mpesaCheckoutId: checkoutID,
        paymentMethod: 'M-Pesa',
        amount: totalCents,
        mpesaReceiptNumber: mpesaReceiptNumber,
        transactionDate: transactionDate,
        subtotalCents: subTotalCents,
        taxCents: taxCents
      };
      
      console.log('Submitting order:', orderData);
      
      // Use the full backend URL for API requests
      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(orderData)
      });
      
      const responseData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(responseData.error || 'Failed to finalize order');
      }
      
      console.log('Order created successfully:', responseData);
      
      // Show success message and show options modal
      updatePaymentStatusUI('Order placed successfully!');
      cartInstance.emptyCart();
      
      // Show order confirmation modal with options
      await showOrderConfirmationModal(responseData.order);
      
      return true;
    } catch (err) {
      console.error('Order creation error:', err);
      updatePaymentStatusUI(`Payment successful but order creation failed: ${err.message}`, true);
      paymentSection.style.display = 'none';
      confirmationSection.style.display = 'block';
      finalTotalSpan.textContent = formatCurrency(totalCents * 1.16);
      return false;
    }
  }

  // New function to show order confirmation modal
  async function showOrderConfirmationModal(order) {
    const result = await Swal.fire({
      title: 'Order Placed Successfully!',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total Amount:</strong> ${formatCurrency(order.total_cost_cents)}</p>
          <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method || 'M-Pesa'}</p>
          ${order.mpesa_receipt_number ? `<p><strong>M-Pesa Receipt:</strong> ${order.mpesa_receipt_number}</p>` : ''}
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'View All Orders',
      cancelButtonText: 'Save to My Device',
      reverseButtons: true,
      allowOutsideClick: false
    });

    if (result.isConfirmed) {
      // User clicked "View All Orders"
      window.location.href = '/pages/all-orders.html';
    } else {
      // User clicked "Save to My Device"
      await showQRCodeModal(order);
    }
  }

  // New function to show QR code modal
  async function showQRCodeModal(order) {
    try {
      // Check if QRCode library is available
      if (typeof QRCode === 'undefined') {
        console.warn('QRCode library not available, waiting for it to load...');
        
        // Wait for QRCode to load (up to 5 seconds)
        for (let i = 0; i < 50; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (typeof QRCode !== 'undefined') {
            console.log('QRCode library loaded after waiting');
            break;
          }
        }
        
        // Final check
        if (typeof QRCode === 'undefined') {
          console.warn('QRCode library still not available after waiting');
          await Swal.fire({
            title: 'Order Saved',
            text: 'Your order has been saved to your device, but QR code generation is not available.',
            icon: 'success',
            confirmButtonText: 'View All Orders'
          });
          window.location.href = '/pages/all-orders.html';
          return;
        }
      }
      
      // Create QR code data
      const qrData = {
        orderId: order.id,
        totalCost: order.total_cost_cents,
        items: order.order_items || [],
        deliveryAddress: order.delivery_address,
        orderTime: order.order_time,
        paymentMethod: order.payment_method || 'M-Pesa',
        mpesaReceipt: order.mpesa_receipt_number || ''
      };

      // Save order to localStorage
      const storageKey = `orderNeszi_${order.id}`;
      localStorage.setItem(storageKey, JSON.stringify(order));

      // Generate QR code
      const qrCodeData = JSON.stringify(qrData);
      
      // Check if we're using the fallback implementation
      let qrCodeImage;
      if (QRCode === window.QRCodeFallback) {
        // Use fallback implementation
        qrCodeImage = await QRCode.generate(qrCodeData, { width: 200, height: 200 });
      } else {
        // Use real QRCode library
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, qrCodeData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        qrCodeImage = canvas.toDataURL();
      }

      await Swal.fire({
        title: 'Order Saved to Your Device',
        html: `
          <div style="text-align: center; margin: 20px 0;">
            <p>Your order has been saved locally with a QR code.</p>
            <div style="margin: 20px 0;">
              <img src="${qrCodeImage}" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #ddd; border-radius: 8px;" />
            </div>
            <p style="font-size: 0.9em; color: #666;">
              <strong>Order ID:</strong> ${order.id}<br>
              <strong>Total:</strong> ${formatCurrency(order.total_cost_cents)}
            </p>
            <p style="font-size: 0.8em; color: #888; margin-top: 10px;">
              You can scan this QR code to view your order details anytime.
            </p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'View All Orders',
        allowOutsideClick: false
      });

      // Redirect to all orders page
      window.location.href = '/pages/all-orders.html';
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Fallback if QR generation fails
      await Swal.fire({
        title: 'Order Saved',
        text: 'Your order has been saved to your device, but QR code generation failed.',
        icon: 'success',
        confirmButtonText: 'View All Orders'
      });
      
      window.location.href = '/pages/all-orders.html';
    }
  }

  async function checkPaymentStatus(checkoutID) {
    try {
      console.log('Checking payment status from backend for ID:', checkoutID);

      // Always query our backend's internal status store with full URL
      const response = await fetch(`http://localhost:5000/api/mpesa/status/${encodeURIComponent(checkoutID)}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If our backend returns an error or 404 (status not found),
        // it means the payment is genuinely not yet known or failed to process internally.
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend payment status check failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Unknown error from backend status check'
        });
        // Return a status that indicates an error or pending, so polling can continue or stop.
        return {
          success: false,
          status: 'pending', // Treat as pending if not found
          error: errorData.error || `Failed to get status from backend: ${response.statusText}`
        };
      }

      const result = await response.json();
      console.log('Backend internal payment status response:', result);

      // The backend's checkPaymentStatus already returns { success, status, ... }
      // We will now always return this result, and the polling loop will interpret it.
      return result;
      
    } catch (error) {
      console.error('Error in checkPaymentStatus:', {
        error: error.message,
        stack: error.stack
      });
      return { 
        success: false, 
        error: error.message,
        status: 'error'
      };
    }
  }

  function startPaymentPolling(checkoutID) {
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 3 seconds = 90 seconds total
    let lastStatus = '';
    let pollingInterval;
    
    // Disable the pay button during polling
    payNowBtn.disabled = true;
    
    // Initial status
    updatePaymentStatusUI('Waiting for payment confirmation...', false, true);
    
    const checkStatus = async () => {
      try {
        attempts++;
        
        if (attempts > maxAttempts) {
          clearInterval(pollingInterval);
          updatePaymentStatusUI('Payment timed out. Please check your M-Pesa messages and refresh the page.', true);
          payNowBtn.disabled = false;
          return;
        }
        
        console.log(`Checking payment status (attempt ${attempts}/${maxAttempts})`);
        const statusData = await checkPaymentStatus(checkoutID);
        console.log('Payment status data:', statusData);
        
        // Handle completed payment
        if (statusData.status === 'completed') {
          clearInterval(pollingInterval);
          isPaymentSuccessful = true;
          updatePaymentStatusUI('Payment successful! Creating your order...', false, true);
          
          try {
            // Extract M-Pesa receipt number and transaction date from statusData
            const mpesaReceiptNumber = statusData.mpesaReceiptNumber || statusData.MpesaReceiptNumber || '';
            const transactionDate = statusData.transactionDate || '';
            
            console.log('Creating order with details:', {
              checkoutID,
              mpesaReceiptNumber,
              transactionDate
            });
            
            await createOrder(checkoutID, mpesaReceiptNumber, transactionDate);
            
            // Show success message and navigate to confirmation
            paymentSection.style.display = 'none';
            confirmationSection.style.display = 'block';
          } catch (error) {
            console.error('Error creating order:', error);
            updatePaymentStatusUI(
              `Payment successful but failed to create order: ${error.message}. Please contact support.`, 
              true
            );
            payNowBtn.disabled = false;
          }
          return;
        }
        
        // Handle failed or cancelled payments
        if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          clearInterval(pollingInterval);
          const errorMsg = statusData.ResultDesc || statusData.error || `Payment ${statusData.status}. Please try again.`;
          updatePaymentStatusUI(errorMsg, true);
          payNowBtn.disabled = false;
          return;
        }
        
        // Handle pending status or unknown status
        const currentStatus = statusData.ResultDesc || statusData.status || 'pending';
        if (currentStatus !== lastStatus) {
          lastStatus = currentStatus;
          updatePaymentStatusUI(
            currentStatus === 'pending' 
              ? `Waiting for payment confirmation... (${attempts}/${maxAttempts})`
              : `Payment status: ${currentStatus} (${attempts}/${maxAttempts})`,
            false,
            true
          );
        }
      } catch (error) {
        console.error('Error during payment polling:', error);
        if (attempts >= maxAttempts) {
          clearInterval(pollingInterval);
          updatePaymentStatusUI('Error verifying payment. Please check your M-Pesa messages and refresh the page.', true);
          payNowBtn.disabled = false;
        } else {
          // Show error but continue polling
          updatePaymentStatusUI(
            `Encountered an error. Retrying... (${attempts}/${maxAttempts})`,
            true,
            true
          );
        }
      }
      
      try {
        // Check our server for the payment status
        const statusData = await checkPaymentStatus(checkoutID);
        console.log('Payment status check:', statusData);
        
        // If we have a successful payment
        if (statusData.status === 'completed' || statusData.status === 'success') {
          clearInterval(pollingInterval);
          isPaymentSuccessful = true;
          updatePaymentStatusUI('Payment successful! Creating your order...', false, true);
          
          // Create the order
          try {
            await createOrder(checkoutID);
            // Show success message and navigate to confirmation
            paymentSection.style.display = 'none';
            confirmationSection.style.display = 'block';
          } catch (error) {
            console.error('Error creating order:', error);
            updatePaymentStatusUI('Payment successful but failed to create order. Please contact support.', true);
            payNowBtn.disabled = false;
          }
          return;
        }
        
        // If payment failed
        if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          clearInterval(pollingInterval);
          updatePaymentStatusUI(`Payment ${statusData.status}. Please try again.`, true);
          payNowBtn.disabled = false;
          return;
        }
        
        // Update status message if it changed
        const currentStatus = statusData.ResultDesc || statusData.status || 'pending';
        if (currentStatus !== lastStatus) {
          lastStatus = currentStatus;
          updatePaymentStatusUI(
            currentStatus === 'pending' 
              ? `Waiting for payment confirmation... (${attempts}/${maxAttempts})`
              : `Payment status: ${currentStatus}`,
            false,
            true
          );
        }
        
      } catch (error) {
        console.error('Error during payment polling:', error);
        updatePaymentStatusUI(
          `Error checking payment status: ${error.message}. Retrying... (${attempts}/${maxAttempts})`,
          true
        );
      }
    };
    
    // Initial check
    checkStatus();
    
    // Set up polling interval (every 3 seconds)
    pollingInterval = setInterval(checkStatus, 3000);
  }
}); 