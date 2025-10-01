// -------------------------------
// 1️⃣ Cardápio
// -------------------------------
let pratos = [
  {nome:"Porção de arroz", preco:18.00, categoria:"comida"},
  {nome:"Prato feito", preco:35.00, categoria:"comida"},
  {nome:"Refrigerante", preco:6.00, categoria:"bebida"},
  {nome:"Suco de goiaba", preco:8.00, categoria:"bebida"},
  {nome:"Café", preco:5.00, categoria:"bebida"},
  {nome:"Pudim", preco:12.00, categoria:"sobremesa"},
  {nome:"bolo", preco:10.00, categoria:"sobremesa"},
  {nome:"coxinha", preco:5.00, categoria:"salgado"},
  {nome:"bomba", preco:5.00, categoria:"salgado"},
  {nome:"pastel", preco:5.00, categoria:"salgado"},
  {nome:"esfirra", preco:5.00, categoria:"salgado"},
  {nome:"torta", preco:8.00, categoria:"sobremesa"},
  {nome:"Suco de caju", preco:7.00, categoria:"bebida"},
  {nome:"macarronada", preco:27.00, categoria:"comida"}
];

function adicionarPrato() {
  let nome = document.getElementById("nomePrato").value.trim();
  let preco = parseFloat(document.getElementById("precoPrato").value);
  let categoria = document.getElementById("categoriaPrato").value;

  if (!nome || isNaN(preco) || preco <= 0) {
    alert("Preencha nome e preço válidos!");
    return;
  }

  pratos.push({nome, preco, categoria});
  document.getElementById("nomePrato").value = "";
  document.getElementById("precoPrato").value = "";
  atualizarCardapio();
}

function atualizarCardapio() {
  const div = document.querySelector(".cardapio");
  div.innerHTML = "";

  const categorias = ["comida", "bebida", "sobremesa", "salgado"];
  categorias.forEach(cat => {
    const container = document.createElement("div");
    container.className = "categoria-container";

    const titulo = document.createElement("h3");
    titulo.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    container.appendChild(titulo);

    pratos.filter(p => p.categoria === cat).forEach(p => {
      const item = document.createElement("div");
      item.className = "item";
      item.innerHTML = `
        <strong>${p.nome}</strong><br>
        R$ ${p.preco.toFixed(2)}<br>
        <button onclick="adicionarPedido('${p.nome}', ${p.preco})">Adicionar</button>
      `;
      container.appendChild(item);
    });

    div.appendChild(container);
  });
}

atualizarCardapio();

// -------------------------------
// 2️⃣ Clientes e Pedidos
// -------------------------------
let clientes = {};
let clienteAtivo = null;

function adicionarCliente() {
  let nome = document.getElementById("nomeCliente").value.trim();
  if (nome === "") { alert("Digite o nome do cliente!"); return; }
  if (clientes[nome]) { alert("Esse cliente já existe!"); return; }

  clientes[nome] = { pedidos: [], subtotal: 0 };
  clienteAtivo = nome;
  document.getElementById("nomeCliente").value = "";
  atualizarContas();
}

function adicionarPedido(item, preco) {
  if (!clienteAtivo) { alert("Selecione ou adicione um cliente primeiro!"); return; }
  clientes[clienteAtivo].pedidos.push({ nome: item, preco });
  clientes[clienteAtivo].subtotal += preco;
  atualizarContas();
}

function removerPedido(nome, index) {
  let c = clientes[nome];
  c.subtotal -= c.pedidos[index].preco;
  c.pedidos.splice(index, 1);
  atualizarContas();
}

function selecionarCliente(nome) {
  clienteAtivo = nome;
  atualizarContas();
}

async function fecharConta(nome) {
  let c = clientes[nome];
  if (!c) return;
  let total = c.subtotal.toFixed(2);

  let formaPagamento = document.getElementById(`pagamento_${nome}`).value;
  let hoje = new Date().toISOString().split("T")[0];

  // 🔹 Envia para o servidor Node.js
  try {
    await fetch("/relatorios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente: nome,
        pedidos: c.pedidos,
        total,
        formaPagamento,
        data: hoje
      })
    });

    alert(`Conta de ${nome} paga!\nTotal: R$ ${total}\nPagamento: ${formaPagamento}`);
  } catch (err) {
    alert("Erro ao salvar no servidor: " + err);
  }

  // 🔹 Remove o cliente localmente
  delete clientes[nome];
  if (clienteAtivo === nome) clienteAtivo = null;
  atualizarContas();
}

function atualizarContas() {
  let div = document.getElementById("contas");
  div.innerHTML = "";
  for (let nome in clientes) {
    let c = clientes[nome];
    let total = c.subtotal;
    let bloco = document.createElement("div");
    bloco.className = "cliente";
    bloco.innerHTML = `
      <h3>${nome} ${clienteAtivo === nome ? "(ativo)" : ""}</h3>
      <ul>
        ${c.pedidos.map((p,i)=>`
          <li>${p.nome} - R$ ${p.preco.toFixed(2)}
          <button class="danger" onclick="removerPedido('${nome}', ${i})">❌</button></li>`
        ).join("")}
      </ul>
      <p><strong>Total: R$ ${total.toFixed(2)}</strong></p>

      <label>Forma de Pagamento:
        <select id="pagamento_${nome}">
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão">Cartão</option>
          <option value="PIX">PIX</option>
        </select>
      </label><br><br>

      <button onclick="selecionarCliente('${nome}')">Selecionar Cliente</button>
      <button class="danger" onclick="fecharConta('${nome}')">Pagar / Fechar Conta</button>
    `;
    div.appendChild(bloco);
  }
}
