const table = document.getElementById('table');
const search = document.getElementById('search');
const details = document.getElementById('details');
const detailsContent = document.getElementById('details-content');
const closeBtn = document.getElementById('close');
const roundingCheckbox = document.getElementById('rounding');

let elements = [];

// Load elements data
fetch('data/elements.json').then(r=>r.json()).then(data=>{
  elements = data;
  renderTable();
});

// Minimal renderer: loads data/elements.json and ensures each tile has data-category and a safe class
async function loadElements() {
  try {
    const res = await fetch('data/elements.json');
    const elements = await res.json();
    renderTable(elements);
  } catch (err) {
    console.error('Failed to load elements.json', err);
  }
}

function renderTable(elements = [], filterText=''){
  table.innerHTML = '';
  const grid = document.querySelector('.periodic-grid');
  grid.innerHTML = '';

  // Create a map for quick lookup by position (period, group)
  const positionMap = {};
  elements.forEach(el=>{
    // ensure group and period numeric
    const group = el.group || el.x || null;
    const period = el.period || el.y || null;
    if(group && period){
      positionMap[`${period}-${group}`] = el;
    } else {
      // fallback to atomic number sequence placement - append in first available
      // We'll just push to a fallback array rendered later (simple approach).
    }
  });

  for(let period=1; period<=7; period++){
    for(let group=1; group<=18; group++){
      const key = `${period}-${group}`;
      const el = positionMap[key];
      if(el){
        if(matchesFilter(el, filterText)){
          const tile = makeTile(el);
          table.appendChild(tile);
        } else {
          // if filtered out, append invisible placeholder to keep grid shape
          const ph = document.createElement('div'); ph.className='empty';
          table.appendChild(ph);
        }
      } else {
        const empty = document.createElement('div'); empty.className='empty';
        table.appendChild(empty);
      }
    }
  }

  // add lanthanides/actinides rows (simple horizontal list)
  const lanActGroup = document.createElement('div');
  lanActGroup.style.gridColumn = '1 / -1';
  lanActGroup.style.display = 'grid';
  lanActGroup.style.gridTemplateColumns = 'repeat(18, 1fr)';
  lanActGroup.style.gap = '6px';
  // lanthanides
  const lan = elements.filter(e=>e.series==='lanthanide');
  const act = elements.filter(e=>e.series==='actinide');
  if(lan.length || act.length){
    const heading = document.createElement('div');
    heading.style.gridColumn='1 / -1';
    heading.style.padding='8px 0';
    heading.style.color='var(--muted)';
    heading.textContent = 'Lanthanides & Actinides (click an element)';
    table.appendChild(heading);
    [...lan, ...act].forEach(el=>{
      const tile = makeTile(el);
      tile.style.width='auto';
      table.appendChild(tile);
    });
  }
}

function matchesFilter(el, txt){
  if(!txt) return true;
  txt = txt.toLowerCase();
  return (el.name && el.name.toLowerCase().includes(txt)) ||
         (el.symbol && el.symbol.toLowerCase().includes(txt)) ||
         (String(el.number).includes(txt));
}

function makeTile(el){
  const d = document.createElement('div');
  d.className = 'element';
  d.tabIndex = 0;
  d.setAttribute('data-number', el.number);
  d.innerHTML = `
    <div class="elem-top"><span>#${el.number}</span><span>${el.atomic_mass}</span></div>
    <div class="symbol">${el.symbol}</div>
    <div class="name">${el.name}</div>
  `;
  d.addEventListener('click', ()=>showDetails(el));
  d.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter') showDetails(el); });
  return d;
}

function showDetails(el){
  detailsContent.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = el.name + ' ('+el.symbol+')';
  detailsContent.appendChild(h);

  const para = document.createElement('p');
  para.textContent = el.summary || el.category || '';
  detailsContent.appendChild(para);

  const tableDiv = document.createElement('div');
  tableDiv.innerHTML = `
    <div class="kv"><span>Atomic number</span><strong>${el.number}</strong></div>
    <div class="kv"><span>Atomic mass</span><strong>${el.atomic_mass}</strong></div>
    <div class="kv"><span>Electrons</span><strong>${el.number}</strong></div>
    <div class="kv"><span>Protons</span><strong>${el.number}</strong></div>
    <div class="kv"><span>Neutrons</span><strong id="neutrons">calculating...</strong></div>
    <div class="kv"><span>Period</span><strong>${el.period||'-'}</strong></div>
    <div class="kv"><span>Group</span><strong>${el.group||'-'}</strong></div>
  `;
  detailsContent.appendChild(tableDiv);

  // calculate neutrons
  const atomicMass = Number(el.atomic_mass) || 0;
  const useRound = roundingCheckbox.checked;
  const massNumber = useRound ? Math.round(atomicMass) : atomicMass;
  const neutrons = Math.round(massNumber - el.number);
  const neutEl = detailsContent.querySelector('#neutrons');
  neutEl.textContent = isNaN(neutrons) ? 'unknown' : neutrons;

  details.classList.remove('hidden');
}

closeBtn.addEventListener('click', ()=> details.classList.add('hidden'));
search.addEventListener('input', (e)=> renderTable(elements, e.target.value.trim()));

document.addEventListener('DOMContentLoaded', loadElements);
