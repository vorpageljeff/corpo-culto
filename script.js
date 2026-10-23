const products = [
  { id: 1, name: 'Whey Black 900g', brand: 'Dragon Labs', category: 'proteina', price: 159.9, badge: 'Mais vendido', label: 'Whey', accent: '#ff6a00', options: ['Baunilha', 'Chocolate'] },
  { id: 2, name: 'Creatina Pure 300g', brand: 'Core Nutrition', category: 'creatina', price: 89.9, badge: '100% pura', label: 'Creatina', accent: '#ff9a3d', options: ['300g', 'Sem sabor'] },
  { id: 3, name: 'Pré-Treino Fire 300g', brand: 'Dragon Labs', category: 'energia', price: 119.9, badge: 'Destaque', label: 'Fire', accent: '#e54b19', options: ['Laranja', 'Frutas vermelhas'] },
  { id: 4, name: 'Whey Isolado 900g', brand: 'New Force', category: 'proteina', price: 229.9, badge: 'Premium', label: 'Iso', accent: '#e7b673', options: ['Cookies', 'Chocolate'] },
  { id: 5, name: 'Creatina Performance 150g', brand: 'Elite Fuel', category: 'creatina', price: 59.9, badge: 'Praticidade', label: 'Crea', accent: '#f07c28', options: ['150g', 'Sem sabor'] },
  { id: 6, name: 'Coqueteleira Black 700ml', brand: 'Corpo Culto', category: 'acessorio', price: 34.9, badge: 'Acessório', label: 'Shake', accent: '#ff6a00', options: ['Preta', '700ml'] }
];

const state = { category: 'all', search: '', price: 'all', order: 'featured', cart: [] };
const money = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function filteredProducts() {
  let rows = products.filter(product => state.category === 'all' || product.category === state.category);
  rows = rows.filter(product => `${product.name} ${product.brand}`.toLowerCase().includes(state.search));
  if (state.price === '100') rows = rows.filter(product => product.price <= 100);
  if (state.price === '200') rows = rows.filter(product => product.price <= 200);
  if (state.price === '201') rows = rows.filter(product => product.price > 200);
  if (state.order === 'low') rows.sort((a, b) => a.price - b.price);
  if (state.order === 'high') rows.sort((a, b) => b.price - a.price);
  return rows;
}

function renderProducts() {
  const rows = filteredProducts();
  document.querySelector('#result-count').textContent = rows.length;
  document.querySelector('#products').innerHTML = rows.map(product => `
    <article class="product">
      <div class="product-visual"><span class="badge">${product.badge}</span><div class="product-jar" style="--accent:${product.accent}" data-label="${product.label}"></div></div>
      <div class="product-copy"><span class="product-brand">${product.brand}</span><h3>${product.name}</h3><div class="product-options">${product.options.map(option => `<span>${option}</span>`).join('')}</div><div class="product-bottom"><div class="product-price"><small>a partir de</small><strong>${money(product.price)}</strong></div><button class="add" data-id="${product.id}">Adicionar</button></div></div>
    </article>`).join('');
  document.querySelectorAll('.add').forEach(button => button.addEventListener('click', () => addProduct(Number(button.dataset.id))));
}

function addProduct(id) {
  if (!state.cart.includes(id)) state.cart.push(id);
  renderOrder();
  document.querySelector('#pedido').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderOrder() {
  const rows = state.cart.map(id => products.find(product => product.id === id));
  document.querySelector('#header-count').textContent = rows.length;
  document.querySelector('#order-title').textContent = rows.length ? `${rows.length} ${rows.length === 1 ? 'produto selecionado' : 'produtos selecionados'}` : 'Nenhum produto selecionado';
  document.querySelector('#order-items').innerHTML = rows.length ? rows.map(product => `<div class="order-line"><span>${product.name}<small> · ${product.options[0]}</small></span><strong>${money(product.price)}</strong></div>`).join('') : '<p class="empty">Escolha um produto no catálogo para visualizar o pedido.</p>';
  document.querySelector('#total').textContent = money(rows.reduce((sum, product) => sum + product.price, 0));
}

document.querySelector('#search').addEventListener('input', event => { state.search = event.target.value.trim().toLowerCase(); renderProducts(); });
document.querySelector('#category').addEventListener('change', event => { state.category = event.target.value; document.querySelectorAll('[data-quick]').forEach(button => button.classList.toggle('active', button.dataset.quick === state.category)); renderProducts(); });
document.querySelector('#price').addEventListener('change', event => { state.price = event.target.value; renderProducts(); });
document.querySelector('#order').addEventListener('change', event => { state.order = event.target.value; renderProducts(); });
document.querySelectorAll('[data-quick]').forEach(button => button.addEventListener('click', () => { state.category = button.dataset.quick; document.querySelector('#category').value = state.category; document.querySelectorAll('[data-quick]').forEach(item => item.classList.toggle('active', item === button)); renderProducts(); }));
document.querySelector('#clear-order').addEventListener('click', () => { state.cart = []; renderOrder(); });
document.querySelectorAll('[name=delivery]').forEach(input => input.addEventListener('change', () => { document.querySelector('#address').disabled = input.value !== 'Entrega em Toledo' || !input.checked; }));
document.querySelector('#whatsapp').addEventListener('click', () => {
  const rows = state.cart.map(id => products.find(product => product.id === id));
  const delivery = document.querySelector('[name=delivery]:checked').value;
  const address = document.querySelector('#address').value.trim();
  const message = rows.length ? `Olá, equipe Corpo Culto! Separei estes itens no catálogo:\n\n${rows.map(product => `• ${product.name} — ${product.options[0]} — ${money(product.price)}`).join('\n')}\n\nPreferência: ${delivery}${address ? `\nEndereço: ${address}` : ''}\nTotal estimado: ${money(rows.reduce((sum, product) => sum + product.price, 0))}\n\nPodem confirmar a disponibilidade e as formas de pagamento?` : 'Escolha ao menos um produto para gerar a mensagem.';
  document.querySelector('#message-preview').textContent = message;
  document.querySelector('#preview').showModal();
});
document.querySelectorAll('.close,.close-action').forEach(button => button.addEventListener('click', () => document.querySelector('#preview').close()));

renderProducts();
renderOrder();

// Preenche o resumo apenas na apresentação gravada, sem alterar a experiência normal.
if (new URLSearchParams(window.location.search).get('demo') === 'video') {
  state.cart = [1, 2, 6];
  renderOrder();
}
