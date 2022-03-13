export async function testAPI() {
  const response = fetch(`/api/testAPI`);
  return await response;
}

export async function getAllBooks() {
  const response = await fetch(`/api/books`);
  return await response.json();
}
