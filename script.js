// ===== Seleção de elementos =====
const itemsList = document.getElementById('itemsList');
const addItemBtn = document.getElementById('addItemBtn');
const clearItemsBtn = document.getElementById('clearItemsBtn');
const donationForm = document.getElementById('donationForm');
const preview = document.getElementById('preview');
const totalItems = document.getElementById('totalItems');
const totalWeight = document.getElementById('totalWeight');

let items = [];

// ===== Funções utilitárias =====
function formatQuantity(q, u) {
  return q ? `${q} ${u || ''}`.trim() : '0';
}

// ===== Manipulação de itens =====
function addItem(name = '', qty = 1, unit = 'kg') {
  items.push({ name, qty, unit });
  renderItems();
}

function removeItem(idx) {
  items.splice(idx, 1);
  renderItems();
}

function clearAddressFields() {
  // Limpa apenas campos de endereço e doador
  const fields = ['nome', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep', 'obs'];
  fields.forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
}

function clearItems() {
  items = [];
  renderItems();
}

// ===== Renderização =====
function renderItems() {
  itemsList.innerHTML = '';
  if (items.length === 0) {
    itemsList.innerHTML = '<div class="muted">Nenhum item adicionado.</div>';
  } else {
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
        <button type="button" class="remove" data-idx="${idx}">❌</button>
      `;
      itemsList.appendChild(row);
    });
  }
  attachItemHandlers();
  updatePreview();
}

function attachItemHandlers() {
  document.querySelectorAll('.remove').forEach(btn => {
    btn.onclick = () => removeItem(+btn.dataset.idx);
  });

  document.querySelectorAll('.item-name').forEach(input => {
    input.oninput = () => {
      items[+input.dataset.idx].name = input.value;
      updatePreview();
    };
  });

  document.querySelectorAll('.item-qty').forEach(input => {
    input.oninput = () => {
      items[+input.dataset.idx].qty = parseFloat(input.value) || 0;
      updatePreview();
    };
  });

  document.querySelectorAll('.item-unit').forEach(select => {
    select.onchange = () => {
      items[+select.dataset.idx].unit = select.value;
      updatePreview();
    };
  });
}

function updatePreview() {
  preview.innerHTML = '';
  let totalKG = 0, totalL = 0, totalUN = 0;

  if (items.length === 0) {
    preview.innerHTML = '<div class="muted">Nenhuma doação adicionada ainda.</div>';
  } else {
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'donation-item';
      div.innerHTML = `<div>${it.name || '—'}</div><div class="muted">${formatQuantity(it.qty, it.unit)}</div>`;
      preview.appendChild(div);

      if (it.unit === 'kg') totalKG += it.qty;
      if (it.unit === 'L') totalL += it.qty;
      if (it.unit === 'un') totalUN += it.qty;
    });
  }

  totalItems.textContent = `${items.length} itens`;
  totalWeight.textContent = `${totalKG} kg / ${totalL} L / ${totalUN} UN`;
}

// ===== Botões =====
addItemBtn.onclick = () => {
  addItem();
  clearAddressFields();
};

clearItemsBtn.onclick = () => {
  clearItems();
  clearAddressFields();
};

// ===== Toast =====
function showToast(message = 'DOAÇÃO SALVA', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${message}<div class="progress-bar"></div>`;
  container.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  }, duration);
}

// ===== Envio do formulário =====
donationForm.onsubmit = async e => {
  e.preventDefault();

  if (items.length === 0) {
    showToast('Adicione pelo menos 1 item', 3000);
    return;
  }

  const dataToSend = {
    nome: document.getElementById('nome')?.value || '',
    endereco: document.getElementById('rua')?.value || '',
    numero: document.getElementById('numero')?.value || '',
    complemento: document.getElementById('complemento')?.value || '',
    bairro: document.getElementById('bairro')?.value || '',
    cidade: document.getElementById('cidade')?.value || '',
    estado: document.getElementById('estado')?.value || '',
    cep: document.getElementById('cep')?.value || '',
    obs: document.getElementById('obs')?.value || '',
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
};

// ===== Inicialização =====
renderItems();
