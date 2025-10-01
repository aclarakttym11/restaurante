const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "relatorios.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Garante que o arquivo exista
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

// Rota para listar relatórios
app.get("/relatorios", (req, res) => {
  const data = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(data));
});

// Rota para adicionar relatório
app.post("/relatorios", (req, res) => {
  const novo = req.body; // exemplo: { titulo: "Vendas", conteudo: "Hoje vendemos 10 itens" }
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push({ ...novo, data: new Date().toISOString() });

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ mensagem: "Relatório salvo com sucesso!" });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
