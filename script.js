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
  elements.forEach(el => {
    const elDiv = document.createElement('button');
    elDiv.type = 'button';
    elDiv.className = 'element category-' + (el.category || 'unknown');
    elDiv.setAttribute('data-number', el.number);
    elDiv.setAttribute('aria-label', `${el.name} (${el.symbol}), atomic number ${el.number}`);
    elDiv.innerHTML = `
      <div class="number">${el.number}</div>
      <div class="symbol">${el.symbol}</div>
      <div class="name">${el.name}</div>
      <div class="mass">${el.atomic_mass}</div>
    `;

    // Prefer explicit xpos/ypos if present (common in JSON datasets), fall back to group/period or 1
    let col = Number(el.xpos ?? el.group ?? el.column ?? 1);
    let row = Number(el.ypos ?? el.period ?? el.row ?? 1);

    // sanitize and clamp so values are integers within the grid bounds (18 columns)
    col = Number.isFinite(col) ? Math.max(1, Math.min(18, Math.floor(col))) : 1;
    row = Number.isFinite(row) ? Math.max(1, Math.floor(row)) : 1;

    elDiv.style.gridColumnStart = col;
    elDiv.style.gridRowStart = row;

    // if category is lanthanoid/actinoid ensure they appear on their typical separate rows
    const cat = (el.category || '').toLowerCase();
    if(cat.includes('lanthanoid') || cat.includes('lanthanoid')){ /* defensive check */
      // common layout places lanthanoids on an extra row near the bottom — push them to row 9 (adjust if your CSS uses different rows)
      elDiv.style.gridRowStart = 9;
    }
    if(cat.includes('actinoid') || cat.includes('actinide')){ // accept common naming variants
      elDiv.style.gridRowStart = 10;
    }

    // ensure lanthanoid/actinoid tiles are on top if there is accidental overlap
    if(cat.includes('lanthanoid') || cat.includes('actinoid') || cat.includes('actinide')){
      elDiv.style.zIndex = 3;
    }

    elDiv.addEventListener('click', ()=> openModal(el));
    table.appendChild(elDiv);
  });
}

function openModal(el){
  const mass = parseFloat(el.atomic_mass);
  const neutrons = Number.isFinite(mass) ? Math.round(mass) - el.number : 'N/A';
  modalBody.innerHTML = `
    <h2>${el.name} <small>(${el.symbol})</small></h2>
    <p><strong>Atomic number:</strong> ${el.number}</p>
    <p><strong>Atomic mass:</strong> ${el.atomic_mass}</p>
    <p><strong>Neutrons:</strong> ${neutrons}</p>
    <p><strong>Category:</strong> ${toTitleCase(el.category || 'unknown')}</p>
    <p>${el.summary || ''}</p>
  `;
  modal.setAttribute('aria-hidden','false');
}

closeModal.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.setAttribute('aria-hidden','true');
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

