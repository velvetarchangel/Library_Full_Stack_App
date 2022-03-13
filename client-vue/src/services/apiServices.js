export async function testAPI() {
  const test = await fetch(`http://localhost:5001/testAPI`).then((response) =>
    response.json()
  );
  return await test;
}

export async function getAllBooks() {
  const response = await fetch(`/api/books`);
  return await response.json();
}
