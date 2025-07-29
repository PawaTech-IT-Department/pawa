import axios from "axios";
import crypto from "crypto";

// M-Pesa API Credentials
const consumerKey = "Q0LFqeyglKs9wfNmgSyNLGVHNyn4vPFqUlJnAdmnqkh1mYOA";
const consumerSecret =
  "pxuff130sJBE9DeRCw9OXDX9wdpMkvnsEskyAVTm2YMjZbAWAUE1Zi3eLASLtvdY";
const businessShortCode = "174379";
const passkey =
  "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get M-Pesa API access token with caching
 */
async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const auth = Buffer.from(
    encodeURIComponent(consumerKey) + ":" + encodeURIComponent(consumerSecret)
  ).toString("base64");

  try {
    const { data } = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!data.access_token) {
      throw new Error("No access token in response");
    }

    cachedToken = data.access_token;
    tokenExpiry =
      Date.now() + (parseInt(data.expires_in || 3599, 10) - 60) * 1000; // 1 hour minus 60 seconds buffer

    console.log("New access token generated");
    return cachedToken;
  } catch (error) {
    console.error("Error getting access token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

/**
 * Generate timestamp in format YYYYMMDDHHmmss
 */
function getTimestamp() {
  // Get current time in UTC+3 (Nairobi time)
  const now = new Date();
  const nairobiOffset = 3 * 60 * 60 * 1000; // UTC+3 in milliseconds
  const nairobiTime = new Date(now.getTime() + nairobiOffset);

  return [
    nairobiTime.getUTCFullYear(),
    (nairobiTime.getUTCMonth() + 1).toString().padStart(2, "0"),
    nairobiTime.getUTCDate().toString().padStart(2, "0"),
    nairobiTime.getUTCHours().toString().padStart(2, "0"),
    nairobiTime.getUTCMinutes().toString().padStart(2, "0"),
    nairobiTime.getUTCSeconds().toString().padStart(2, "0"),
  ].join("");
}

/**
 * Generate M-Pesa API password
 */
// ✅ Keep this implementation (it's correct)
function getPassword(timestamp) {
  return Buffer.from(businessShortCode + passkey + timestamp).toString(
    "base64"
  );
}

// Helper function to generate password with timestamp
function generatePassword(timestamp) {
  const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');
  return password;
}

// Helper function to validate phone number
function validatePhoneNumber(phone) {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different phone number formats
  if (digits.startsWith('0')) {
    return `254${digits.substring(1)}`; // Convert 07... to 2547...
  } else if (digits.startsWith('254')) {
    return digits; // Already in correct format
  } else if (digits.startsWith('7')) {
    return `254${digits}`; // Convert 7... to 2547...
  }
  
  throw new Error('Invalid phone number format');
}

const mpesaController = {
  /**
   * Initiate STK Push payment
   */
  stkPush: async (req, res) => {
    try {
      // Validate request
      const { phoneNumber: phoneInput } = req.body;
      
      if (!phoneInput) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required',
        });
      }
      
      // Format and validate phone number
      const formattedPhone = validatePhoneNumber(phoneInput);
      
      // Use fixed amount of 1 KES for testing
      const parsedAmount = 1;
      
      // Generate unique reference
      const accountReference = `PAWA-${Date.now()}`;
      
      // Get access token
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get M-Pesa access token");
      }

      // Prepare the request payload
      const requestTimestamp = getTimestamp();
      const payload = {
        BusinessShortCode: businessShortCode,
        Password: generatePassword(requestTimestamp),
        Timestamp: requestTimestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: parsedAmount,
        PartyA: formattedPhone,
        PartyB: businessShortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.BASE_URL || 'http://localhost:5000'}/api/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: "Payment for goods",
      };

      // Log the request for debugging
      console.log("Sending STK Push request:", {
        url: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        headers: { Authorization: `Bearer ${accessToken}` },
        data: payload,
      });

      // Make the API request
      const response = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Store initial payment status
      if (response.data.CheckoutRequestID) {
        mpesaController.paymentStatuses.set(response.data.CheckoutRequestID, {
          status: 'pending',
          timestamp: new Date().toISOString(),
          amount: parsedAmount,
          phoneNumber: formattedPhone,
          accountReference: `PAWA-${Date.now()}`,
        });
        
        // Return the checkout request ID to the client
        return res.json({
          success: true,
          CheckoutRequestID: response.data.CheckoutRequestID,
          ResponseDescription: response.data.ResponseDescription,
          CustomerMessage: response.data.CustomerMessage,
        });
      }
      
      throw new Error('No CheckoutRequestID in response');
    } catch (error) {
      console.error("STK PUSH ERROR:", {
        message: error.message,
        response: error.response?.data,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });

      let errorMessage = "Payment request failed";
      let statusCode = 500;

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        statusCode = error.response.status || 500;
        errorMessage =
          error.response.data?.errorMessage ||
          error.response.data?.error?.message ||
          error.response.statusText ||
          "Payment request failed";
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from M-Pesa API. Please try again.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || "Payment request failed";
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: error.message,
                code: error.code,
                response: error.response?.data,
              }
            : undefined,
      });
    }
  },

  /**
   * Query STK Push status
   */
  stkPushQuery: async (req, res) => {
    try {
      // Accept both camelCase and PascalCase for the checkout request ID
      const checkoutRequestID = req.body.checkoutRequestID || req.body.CheckoutRequestID;

      if (!checkoutRequestID) {
        return res.status(400).json({
          success: false,
          error: "checkoutRequestID is required",
        });
      }

      console.log('Querying payment status for checkout ID:', checkoutRequestID);
      
      const timestamp = getTimestamp();
      const password = getPassword(timestamp);
      const accessToken = await getAccessToken();

      const payload = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      console.log('Sending STK query with payload:', JSON.stringify(payload, null, 2));

      const { data } = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );
      
      // Standardize the response format
      let response = {
        success: false,
        ResultCode: 'ERROR',
        ResultDesc: 'Unknown response format',
        rawData: data
      };

      if (data.ResultCode !== undefined) {
        // Direct response format
        response = {
          success: data.ResultCode === '0',
          ResultCode: data.ResultCode,
          ResultDesc: data.ResultDesc || 'No description',
          rawData: data
        };
      } else if (data.Body?.stkCallback) {
        // Nested response format
        response = {
          success: data.Body.stkCallback.ResultCode === '0',
          ResultCode: data.Body.stkCallback.ResultCode,
          ResultDesc: data.Body.stkCallback.ResultDesc || 'No description',
          rawData: data
        };
      }

      // If we have a successful response, log it
      if (response.success) {
        console.log('Payment successful:', response);
      } else {
        console.warn('Payment query result:', response);
      }

      res.json(response);
    } catch (error) {
      console.error("STK QUERY ERROR:", {
        message: error.message,
        response: error.response?.data,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });

      res.status(500).json({
        success: false,
        error:
          error.response?.data?.errorMessage ||
          error.message ||
          "Failed to query payment status",
      });
    }
  },

  /**
   * In-memory store for payment statuses
   * In production, replace this with a proper database table
   */
  paymentStatuses: new Map(),

  /**
   * Handle M-Pesa callback
   */
  handleCallback: async (req, res) => {
    try {
      const callbackData = req.body;
      console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));
      
      // Always respond to M-Pesa immediately to prevent retries
      const sendSuccessResponse = () => {
        res.status(200).json({
          ResultCode: 0,
          ResultDesc: 'Success',
        });
      };

      // Extract the important information from the callback
      let resultCode, resultDesc, checkoutRequestID, mpesaReceiptNumber, amount, phoneNumber, transactionDate, accountReference;
      
      // Check if this is a valid callback
      if (!callbackData.Body || !callbackData.Body.stkCallback) {
        console.error('Invalid callback format:', callbackData);
        return sendSuccessResponse();
      }
      
      // Process the callback
      const stkCallback = callbackData.Body.stkCallback;
      resultCode = stkCallback.ResultCode.toString();
      resultDesc = stkCallback.ResultDesc;
      checkoutRequestID = stkCallback.CheckoutRequestID || stkCallback.checkoutRequestID;
      
      if (!checkoutRequestID) {
        console.error('No CheckoutRequestID in callback:', stkCallback);
        return sendSuccessResponse();
      }
      
      // Get existing payment status or create a new one
      const currentPaymentStatus = mpesaController.paymentStatuses.get(checkoutRequestID) || {
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      
      // Update status based on result code
      if (resultCode === '0') {
        // Success - extract payment details
        currentPaymentStatus.status = 'completed';
        currentPaymentStatus.completedAt = new Date().toISOString();
        
        if (stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) {
          stkCallback.CallbackMetadata.Item.forEach(item => {
            if (item.Name === 'Amount') currentPaymentStatus.amount = item.Value;
            if (item.Name === 'MpesaReceiptNumber') currentPaymentStatus.mpesaReceiptNumber = item.Value;
            if (item.Name === 'PhoneNumber') currentPaymentStatus.phoneNumber = item.Value.toString();
            if (item.Name === 'TransactionDate') currentPaymentStatus.transactionDate = item.Value.toString();
          });
        }
      } else {
        // Failed or cancelled
        currentPaymentStatus.status = resultCode === '1032' ? 'cancelled' : 'failed';
        currentPaymentStatus.error = resultDesc;
        currentPaymentStatus.updatedAt = new Date().toISOString();
      }
      
      // Update the status in our store
      mpesaController.paymentStatuses.set(checkoutRequestID, currentPaymentStatus);
      console.log('Updated payment status:', currentPaymentStatus);
      
      // In a production environment, you would also update your database here
      // and trigger any necessary business logic (e.g., send confirmation email)
      
      return sendSuccessResponse();

      // Create a payment status object
      const paymentStatus = {
        success: resultCode === '0',
        resultCode,
        resultDesc,
        checkoutRequestID,
        mpesaReceiptNumber,
        amount,
        phoneNumber,
        transactionDate,
        timestamp: new Date().toISOString(),
        rawData: callbackData
      };

      // Store the payment status (in production, use a database)
      this.paymentStatuses.set(checkoutRequestID, paymentStatus);
      console.log('Payment status stored:', paymentStatus);

      // Always respond with success to M-Pesa
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Callback processed successfully",
      });
    } catch (error) {
      console.error("CALLBACK ERROR:", error);
      res.status(200).json({  // Still return 200 to M-Pesa
        ResultCode: 1,
        ResultDesc: `Error processing callback: ${error.message}`,
      });
    }
  },

  /**
   * Check payment status by checkoutRequestID
   */
  checkPaymentStatus: async (req, res) => {
    try {
      const { checkoutRequestID } = req.params;
      
      if (!checkoutRequestID) {
        return res.status(400).json({
          success: false,
          error: 'checkoutRequestID is required'
        });
      }
      
      // Check in-memory store (replace with database query in production)
      const paymentStatus = mpesaController.paymentStatuses.get(checkoutRequestID);
      
      if (!paymentStatus) {
        return res.status(404).json({
          success: false,
          error: 'Payment status not found',
          status: 'pending' // Default status if not found
        });
      }
      
      res.json({
        success: true,
        ...paymentStatus
      });
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check payment status',
        details: error.message
      });
    }
  },
};

// Test credentials on startup
async function testCredentials() {
  try {
    console.log("Testing M-Pesa credentials...");

    const timestamp = getTimestamp();
    console.log("Timestamp:", timestamp);
    console.log("Password:", getPassword(timestamp));

    const token = await getAccessToken();
    console.log("Access token retrieved successfully");
    console.log("Token (first 20 chars):", token.substring(0, 20) + "...");

    return true;
  } catch (error) {
    console.error("CREDENTIAL TEST FAILED:", error.message);
    return false;
  }
}
async function testDarajaIntegration() {
  const timestamp = getTimestamp();
  console.log("NAIROBI TIMESTAMP:", timestamp);
  console.log("PASSWORD:", getPassword(timestamp));

  const token = await getAccessToken();
  console.log("TOKEN LENGTH:", token.length);

  // Test STK push with minimal payload
  const testPayload = {
    BusinessShortCode: businessShortCode,
    Password: getPassword(timestamp),
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: 1,
    PartyA: "254708032060",
    PartyB: businessShortCode,
    PhoneNumber: "254708032060",
    CallBackURL: "https://example.com/callback", // Temporary
    AccountReference: "TEST",
    TransactionDesc: "Integration Test",
  };

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      testPayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("✅ STK PUSH SUCCESS:", response.data);
    return true;
  } catch (error) {
    console.error("❌ STK PUSH ERROR:", {
      status: error.response?.status,
      data: error.response?.data,
      timestamp,
      password: getPassword(timestamp),
    });
    return false;
  }
}

// Run test on module load (but don't block server startup)
// if (process.env.NODE_ENV !== "test") {
//   (async () => {
//     console.log("Running M-Pesa startup checks...");
//     const credentialsOk = await testCredentials();
//     console.log(
//       credentialsOk
//         ? "✅ M-Pesa credentials are valid"
//         : "❌ M-Pesa credentials test failed. Please check your credentials."
//     );

//     if (credentialsOk) {
//       const integrationOk = await testDarajaIntegration();
//       console.log(
//         integrationOk
//           ? "✅ M-Pesa Daraja Integration is valid"
//           : "❌ M-Pesa Daraja Integration test failed. Please check your implementation."
//       );
//     }
//   })().catch((err) =>
//     console.error("Error during M-Pesa startup checks:", err)
//   );
// }

export default mpesaController;
