import axios from "axios";
const API_URL = "http://localhost:5001";

export async function testAPI() {
  const test = await fetch(`${API_URL}/testAPI`).then((response) =>
    response.json()
  );
  return await test;
}

/**Get user wrapper function used to interphase with login  */
export async function getUserByEmailAndPassword(user) {
  const response = await axios.post(`${API_URL}/getUser`, user);
  console.log(response);
  return response;
}
