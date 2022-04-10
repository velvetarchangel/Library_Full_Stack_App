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

/**
 *
 * @returns an array of library customers
 */
export async function getAllLibraryCustomers() {
	const response = await axios.get(`${API_URL}/users`);
	return response;
}

/**
 *
 * @returnsan array of events with event id as key
 */
export async function getAllEvents() {
	const response = await axios.get(`${API_URL}/events`);
	return response;
}

/**
 *
 * @param {*} userId card_no from the front end
 * @returns a user object with name and email
 */
export async function getUserByID(userId) {
	const response = await axios.get(`${API_URL}/user/${userId}`);
	return response;
}

// kelly
/**
 * @returns array of item objects retreived from the database
 */
export async function getAllItems() {
	const response = await axios.get(`${API_URL}/items`);
	return response;
}

// kelly
/**
 * @returns array of available item objects retreived from the database
 */
export async function getAvailableItems() {
	const response = await axios.get(`${API_URL}/availableItems`);
	return response;
}

//kelly
/**
 *
 * @param {*} object with user card_no to add to signed_out in database
 * @returns response with the user object once its added to the database
 * 					or error message if the item is not available
 */
export async function createSignedOutObject(userId, itemId, branchId) {
	/*	console.log(
		"user: " + userId.card_no + "\nitem " + itemId + "\nbranch: " + branchId
	);
*/ const response = await axios.post(
		`${API_URL}/signout/${itemId}/${branchId}`,
		userId
	);
	//console.log(response);
	return response;
}

// kelly
/**
 * @returns array of branch objects retreived from the database
 */
export async function getBranches() {
	const response = await axios.get(`${API_URL}/branches`);
	return response;
}
