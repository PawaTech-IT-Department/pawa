export let orders = JSON.parse(localStorage.getItem("orders")) || [];

export function saveOrdersToLocalStorage() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

export function addOrder(order) {
  orders.push(order);
  saveOrdersToLocalStorage();
}
