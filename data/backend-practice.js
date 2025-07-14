const xhr = new XMLHttpRequest();
xhr.open("GET", "https://supersimplebackend.dev/product");
xhr.send();
const checkResponse = function () {
  const response = xhr.response;
  console.log(response);
};
xhr.addEventListener("load", checkResponse);
