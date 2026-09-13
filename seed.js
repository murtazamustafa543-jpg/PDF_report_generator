const db = require("./db");

const products = ["Notebook", "Backpack", "Water Bottle", "Desk Lamp", "Headphones", "Mouse Pad"];
const customers = ["Alice", "Bilal", "Chen", "Diego", "Emma", "Farrukh", "Grace", "Hassan"];

function randomDate(daysBack) {
  const now = Date.now();
  const past = now - Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString().slice(0, 10); // YYYY-MM-DD
}

// Delete all rows first so running this twice doesn't double the data
db.exec("DELETE FROM orders");

const insert = db.prepare(
  "INSERT INTO orders (customer, product, amount, created_at) VALUES (?, ?, ?, ?)"
);

for (let i = 0; i < 200; i++) {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  const amount = (Math.random() * 195 + 5).toFixed(2); // 5 to 200
  const created_at = randomDate(30); // last 30 days

  insert.run(customer, product, Number(amount), created_at);
}

console.log("Seeded 200 orders.");