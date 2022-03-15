import axios from "axios";
const API_URL = "http://localhost:5001";

export async function testAPI() {
  const test = await fetch(`${API_URL}/testAPI`).then((response) =>
    response.json()
  );
  return await test;
}

/**
 *
 * @param {*} user object with information to add user to the database
 * @returns response with the user object once its added to the database
 * or error message if the email is already in the database
 */
export async function createUser(user) {
  const response = await axios.post(`${API_URL}/addUser`, user);
  console.log(response);
  return response;
}

/**
 *
 * @param {*} user object email and password from the front end
 * @returns user object retreived from the database
 */
export async function getUserByEmailAndPassword(user) {
  const response = await axios.post(`${API_URL}/getUser`, user);
  return response;
}
