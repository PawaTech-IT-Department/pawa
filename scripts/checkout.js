import { renderOrderSummary } from "./checkout/orderSummary.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";

document.addEventListener("DOMContentLoaded", function () {
  renderOrderSummary();
  renderPaymentSummary();
});
