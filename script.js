// Seleção dos elementos
const itemsList = document.getElementById('itemsList');
const addItemBtn = document.getElementById('addItemBtn');
const clearItemsBtn = document.getElementById('clearItemsBtn');
const donationForm = document.getElementById('donationForm');
const preview = document.getElementById('preview');
const totalItems = document.getElementById('totalItems');
const totalWeight = document.getElementById('totalWeight');

let items = [];

// Formata quantidade
function formatQuantity(q, u) {
  if (!q) return '0';
  return `${q} ${u || ''}`.trim();
}

// Adiciona item
function addItem(name = '', qty = 1, unit = 'kg') {
  items.push({ name, qty, unit });
  renderItems();
}

// Remove item pelo índice
function removeItem(idx) {
  items.splice(idx, 1);
  renderItems();
}

// Limpa apenas os campos do formulário de endereço
function clearAddressFields() {
  donationForm.reset();
}

// Limpa toda a lista de itens
function clearItems() {
  items = [];
  renderItems();
}

// Renderiza a lista de itens
function renderItems() {
  itemsList.innerHTML = '';

  if (items.length === 0) {
    itemsList.innerHTML = '<div class="muted">Nenhum item adicionado.</div>';
  }

  items.forEach((it, idx) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="item-name" data-idx="${idx}" value="${it.name}" />
      <input type="number" class="item-qty" data-idx="${idx}" min="0" step="0.1" value="${it.qty}" style="width:120px" />
      <div class="select-wrapper">
        <select class="item-unit" data-idx="${idx}">
          <option value="kg" ${it.unit==='kg'?'selected':''}>KG</option>
          <option value="L" ${it.unit==='L'?'selected':''}>L</option>
          <option value="un" ${it.unit==='un'?'selected':''}>UN</option>
        </select>
      </div>
      <button class="remove" data-idx="${idx}">❌</button>
    `;
    itemsList.appendChild(row);
  });

  attachItemHandlers();
  updatePreview();
}

// Adiciona eventos aos inputs e botões
function attachItemHandlers() {
  document.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = +e.target.dataset.idx;
      removeItem(i);
    });
  });

  document.querySelectorAll('.item-name').forEach(input => {
    input.addEventListener('input', e => {
      const i = +e.target.dataset.idx;
      items[i].name = e.target.value;
      updatePreview();
    });
  });

  document.querySelectorAll('.item-qty').forEach(input => {
    input.addEventListener('input', e => {
      const i = +e.target.dataset.idx;
      items[i].qty = parseFloat(e.target.value) || 0;
      updatePreview();
    });
  });

  document.querySelectorAll('.item-unit').forEach(select => {
    select.addEventListener('change', e => {
      const i = +e.target.dataset.idx;
      items[i].unit = e.target.value;
      updatePreview();
    });
  });
}

// Atualiza o preview
function updatePreview() {
  if (items.length === 0) {
    preview.innerHTML = '<div class="muted">Nenhuma doação adicionada ainda.</div>';
    totalItems.textContent = '0 itens';
    totalWeight.textContent = '0 kg / 0 L / 0 UN';
    return;
  }

  preview.innerHTML = '';
  let totalKG = 0, totalL = 0, totalUN = 0;

  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'donation-item';
    div.innerHTML = `<div>${it.name || '—'}</div><div class="muted">${formatQuantity(it.qty, it.unit)}</div>`;
    preview.appendChild(div);

    if (it.unit === 'kg') totalKG += parseFloat(it.qty) || 0;
    if (it.unit === 'L') totalL += parseFloat(it.qty) || 0;
    if (it.unit === 'un') totalUN += parseFloat(it.qty) || 0;
  });

  totalItems.textContent = `${items.length} itens`;
  totalWeight.textContent = `${totalKG} kg / ${totalL} L / ${totalUN} UN`;
}

// Botões
addItemBtn.addEventListener('click', () => {
  addItem();
  clearAddressFields();
});

clearItemsBtn.addEventListener('click', () => {
  clearItems();
  clearAddressFields();
});

// Toast animado
function showToast(message = 'DOAÇÃO SALVA', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    ${message}
    <div class="progress-bar"></div>
  `;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  }, duration);
}

// Envio do formulário para o backend
donationForm.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData(donationForm);
  const enderecoData = {};
  formData.forEach((value, key) => enderecoData[key] = value);

  // Montando objeto para enviar no formato que o backend espera
 const dataToSend = {
  nome: enderecoData.nome || '',
  endereco: enderecoData.endereco || '',
  cidade: enderecoData.cidade || '',
  estado: enderecoData.estado || '',
  cep: enderecoData.cep || '',
  items: items.map(it => ({
    nome_item: it.name,
    quantidade: it.qty,
    unidade: it.unit
  }))
};

  try {
    const res = await fetch('https://backdoacoes-production.up.railway.app/donation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    const result = await res.json();

    if (result.success) {
      showToast('DOAÇÃO SALVA');
      clearItems();
      clearAddressFields();
    } else {
      console.error(result.error);
      showToast('ERRO AO SALVAR', 3000);
    }
  } catch (err) {
    console.error(err);
    showToast('ERRO AO SALVAR', 3000);
  }
});

// Inicialização
renderItems();
