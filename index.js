const express = require("express");
const path = require("path");
const models = require("./models.json");
const { ModelManager } = require("./ModelManager");

const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize ModelManager and start health monitoring
const modelManager = new ModelManager();

app.get("/api/models", (req, res) => {
  res.json(modelManager.allModelStatus());
});

app.delete("/api/models/:modelId", (req, res) => {
  res.json(modelManager.remove(req.params.modelId));
});

app.post("/api/interview/start/:modelId", async (req, res) => {
  // TODO: assume the value is correct
  const modelId = req.params.modelId;
  const result = await modelManager.use(modelId);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Express app started at http://localhost:${PORT}`);
});
