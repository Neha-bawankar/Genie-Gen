const API_BASE_URL = "http://localhost:8090/api/v1";

fetch(`${API_BASE_URL}/users`)
  .then((res) => res.json())
  .then((data) => console.log(data));


  const token = localStorage.getItem("authToken"); // Retrieve token
fetch("API_ENDPOINT", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});