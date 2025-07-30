import express from "express";
import mpesaController from "../controllers/mpesaController.js";
const router = express.Router();

// M-Pesa endpoints
// POST /api/mpesa/stkpush - Initiate STK push
router.post("/stkpush", mpesaController.stkPush);

// POST /api/mpesa/stkpushquery - Query STK push status
router.post("/stkpushquery", mpesaController.stkPushQuery);

// GET /api/mpesa/status/:checkoutRequestID - Check payment status
router.get("/status/:checkoutRequestID", mpesaController.checkPaymentStatus);

// POST /api/mpesa/callback - M-Pesa callback URL
router.post("/callback", mpesaController.handleCallback);

export default router;
