// Builds the periodic table UI using ELEMENTS defined in elements.js

const table = document.getElementById('table');
const searchInput = document.getElementById('search');
const filterCategory = document.getElementById('filterCategory');
const resetBtn = document.getElementById('reset');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.getElementById('closeModal');

function init(){
  buildCategoryFilter();
  renderTable(ELEMENTS);
  attachListeners();
}

function buildCategoryFilter(){
  const cats = Array.from(new Set(ELEMENTS.map(e=>e.category))).sort();
  cats.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = toTitleCase(c.replace(/-/g,' '));
    filterCategory.appendChild(opt);
  });
}

function toTitleCase(s){ return s.split(' ').map(p=>p[0].toUpperCase()+p.slice(1)).join(' ') }

function renderTable(elements){
  table.innerHTML = '';
  // Determine grid position:
  elements.forEach(el => {
    const elDiv = document.createElement('button');
    elDiv.className = 'element category-' + (el.category || 'unknown');
    elDiv.setAttribute('data-number', el.number);
    elDiv.setAttribute('aria-label', `${el.name} (${el.symbol}), atomic number ${el.number}`);
    elDiv.innerHTML = `
      <div class="number">${el.number}</div>
      <div class="symbol">${el.symbol}</div>
      <div class="name">${el.name}</div>
      <div class="mass">${el.atomic_mass}</div>
    `;
    // CSS grid placement: use group as column and period as row (simple mapping)
    const col = el.group || 1;
    const row = el.period || 1;
    elDiv.style.gridColumnStart = col;
    elDiv.style.gridRowStart = row;
    elDiv.addEventListener('click', ()=>openModal(el));
    table.appendChild(elDiv);
  });
}

function openModal(el){
  modalBody.innerHTML = `
    <h2>${el.name} <small>(${el.symbol})</small></h2>
    <p><strong>Atomic number:</strong> ${el.number}</p>
    <p><strong>Atomic mass:</strong> ${el.atomic_mass}</p>
    <p><strong>Category:</strong> ${toTitleCase(el.category || 'unknown')}</p>
    <p>${el.summary || ''}</p>
  `;
  modal.setAttribute('aria-hidden','false');
}

closeModal.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', (e)=> {
  if(e.target === modal) modal.setAttribute('aria-hidden','true');
});

function attachListeners(){
  searchInput.addEventListener('input', onSearch);
  filterCategory.addEventListener('change', applyFilters);
  resetBtn.addEventListener('click', ()=>{
    searchInput.value=''; filterCategory.value=''; applyFilters();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') modal.setAttribute('aria-hidden','true');
  });
}

function onSearch(){
  const q = searchInput.value.trim().toLowerCase();
  if(!q){ renderTable(ELEMENTS); return; }
  const results = ELEMENTS.filter(el=>{
    return el.name.toLowerCase().includes(q)
      || el.symbol.toLowerCase().includes(q)
      || String(el.number) === q;
  });
  renderTable(results);
}

function applyFilters(){
  const cat = filterCategory.value;
  const q = searchInput.value.trim().toLowerCase();
  let results = ELEMENTS;
  if(cat) results = results.filter(e=>e.category === cat);
  if(q) results = results.filter(el=>{
    return el.name.toLowerCase().includes(q)
      || el.symbol.toLowerCase().includes(q)
      || String(el.number) === q;
  });
  renderTable(results);
}

document.addEventListener('DOMContentLoaded', init);
