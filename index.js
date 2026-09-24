const express = require("express");
const path = require("path");
const db = require("./db");
const renderPdf = require("./render");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
  try {
    console.log("1. Starting...");
    const created_at = new Date().toISOString();

    const insert = db.prepare("INSERT INTO reports (path, created_at) VALUES (?, ?)");
    const result = insert.run("", created_at);
    const id = result.lastInsertRowid;
    console.log("2. Inserted placeholder row, id =", id);

    const filePath = `reports/${id}.pdf`;
    console.log("3. About to render PDF...");
    await renderPdf(filePath);
    console.log("4. PDF rendered!");

    db.prepare("UPDATE reports SET path = ? WHERE id = ?").run(filePath, id);
    console.log("5. Row updated");

    res.status(201).json({ id, file: `/reports/${id}/file` });
    console.log("6. Response sent");
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Failed to generate report" });
  }
});


app.get("/reports/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ ...row, file: `/reports/${row.id}/file` });
});

app.get("/reports/:id/file", (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.resolve(row.path));
});

app.listen(3000, () => console.log("Server running on port 3000"));