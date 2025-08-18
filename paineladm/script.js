const lista = document.getElementById("listaDoacoes");

// ===== Função para buscar doações do backend =====
async function fetchDoacoes() {
  try {
    const res = await fetch("https://backdoacoes-production.up.railway.app/donations");
    const data = await res.json();
    if (data.success) {
      return data.donations;
    } else {
      console.error("Erro ao buscar doações:", data.error);
      return [];
    }
  } catch (err) {
    console.error("Erro ao buscar doações:", err);
    return [];
  }
}

// ===== Função para atualizar o status concluído no backend =====
async function updateConcluido(id, concluido) {
  try {
    await fetch(`https://backdoacoes-production.up.railway.app/donation/${id}/concluido`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido })
    });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
  }
}

// ===== Função para renderizar doações =====
async function renderDoacoes() {
  lista.innerHTML = "";
  const doacoes = await fetchDoacoes();

  doacoes.forEach(d => {
    // Monta a lista de itens
    const itensStr = d.items.map(i => `${i.quantidade} ${i.unidade} de ${i.nome_item}`).join(", ");

    const card = document.createElement("div");
    card.className = "doacao-card";
    card.innerHTML = `
      <div class="doacao-header">
        <div class="doacao-header-left">
          <input type="checkbox" ${d.concluido ? "checked" : ""}>
          <span class="doacao-nome ${d.concluido ? "concluido" : ""}">${d.nome}</span> - ${itensStr}
        </div>
        <span class="doacao-status">📦</span>
      </div>
      <div class="doacao-info">
        <p><strong>Endereço:</strong> ${d.endereco}, ${d.numero} ${d.complemento || ""} - ${d.bairro}, ${d.cidade} - ${d.estado} - CEP: ${d.cep}</p>
        ${d.obs ? `<p><strong>Observação:</strong> ${d.obs}</p>` : ""}
      </div>
    `;

    // Expande/contrai detalhes
    card.addEventListener("click", () => toggleInfo(card));

    // Checkbox de concluído
    const checkbox = card.querySelector("input[type=checkbox]");
    checkbox.addEventListener("click", async (event) => {
      event.stopPropagation(); // não expande o card ao clicar
      const nomeElem = card.querySelector(".doacao-nome");
      const isChecked = checkbox.checked;
      if (isChecked) {
        nomeElem.classList.add("concluido");
      } else {
        nomeElem.classList.remove("concluido");
      }
      await updateConcluido(d.id, isChecked); // salva no backend
    });

    lista.appendChild(card);
  });
}

// ===== Função para expandir/contrair detalhes =====
function toggleInfo(card) {
  const info = card.querySelector(".doacao-info");
  info.style.display = info.style.display === "block" ? "none" : "block";
}

// ===== Inicializa =====
renderDoacoes();
