const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const getReportData = require("./report");

function buildHtml(data) {
  const today = new Date().toISOString().slice(0, 10);

  const topProductsRows = data.topProducts
    .map(p => `<tr><td>${p.product}</td><td>$${p.revenue.toFixed(2)}</td></tr>`)
    .join("");

  // Pull all orders for the long table at the bottom
  const db = require("./db");
  const allOrders = db.prepare("SELECT customer, product, amount, created_at FROM orders ORDER BY created_at").all();

  const allOrdersRows = allOrders
    .map(o => `<tr><td>${o.customer}</td><td>${o.product}</td><td>$${o.amount.toFixed(2)}</td><td>${o.created_at}</td></tr>`)
    .join("");

  return `
  <html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 20px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 12px; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }
    </style>
  </head>
  <body>
    <h1>Sales Report — ${today}</h1>
    <p><strong>Total Orders:</strong> ${data.totalOrders}</p>
    <p><strong>Total Revenue:</strong> $${data.totalRevenue.toFixed(2)}</p>

    <h2>Top 5 Products</h2>
    <table>
      <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
      <tbody>${topProductsRows}</tbody>
    </table>

    <h2>All Orders</h2>
    <table>
      <thead><tr><th>Customer</th><th>Product</th><th>Amount</th><th>Date</th></tr></thead>
      <tbody>${allOrdersRows}</tbody>
    </table>
  </body>
  </html>
  `;
}

async function renderPdf(outputPath) {
  const data = getReportData();
  const html = buildHtml(data);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });
  await browser.close();
}

module.exports = renderPdf;