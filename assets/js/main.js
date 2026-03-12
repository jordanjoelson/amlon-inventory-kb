const searchIndex = [];
document.querySelectorAll('.accordion-item').forEach(item => {
  const section = item.closest('.section');
  const category = section.querySelector('.section-label')?.textContent || '';
  const sectionId = section.id || '';
  const title = item.querySelector('.accordion-title')?.textContent || '';
  const body = item.querySelector('.accordion-content')?.textContent || '';
  searchIndex.push({ category, sectionId, title, body, element: item });
});

const overlay = document.getElementById('searchModal');
const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
let activeIdx = -1;

function openSearch() {
  overlay.style.display = 'flex'; input.value = ''; results.innerHTML = '';
  results.classList.remove('has-query'); activeIdx = -1;
  setTimeout(() => input.focus(), 50);
}
function closeSearch() {
  overlay.style.display = 'none'; input.value = ''; results.innerHTML = '';
  results.classList.remove('has-query');
}

document.querySelector('.nav-search').onclick = openSearch;
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape' && overlay.style.display === 'flex') closeSearch();
});

function highlightMatch(text, query) {
  if (!query) return text;
  let result = text;
  query.trim().split(/\s+/).filter(Boolean).forEach(w => {
    result = result.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark>$1</mark>');
  });
  return result;
}

input.addEventListener('input', () => {
  const q = input.value.trim().toLowerCase();
  results.innerHTML = ''; activeIdx = -1;
  if (!q) { results.classList.remove('has-query'); return; }
  results.classList.add('has-query');
  const words = q.split(/\s+/).filter(Boolean);
  searchIndex.map(entry => {
    let score = 0;
    words.forEach(w => {
      if (entry.title.toLowerCase().includes(w)) score += 10;
      if (entry.category.toLowerCase().includes(w)) score += 5;
      if (entry.body.toLowerCase().includes(w)) score += 2;
    });
    return { ...entry, score };
  }).filter(e => e.score > 0).sort((a,b) => b.score - a.score).forEach((entry, i) => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `<span class="search-result-cat">${entry.category}</span><span class="search-result-title">${highlightMatch(entry.title, q)}</span>`;
    div.onclick = () => goToResult(entry);
    div.onmouseenter = () => { results.querySelectorAll('.active').forEach(el => el.classList.remove('active')); div.classList.add('active'); activeIdx = i; };
    results.appendChild(div);
  });
});

input.addEventListener('keydown', e => {
  const items = results.querySelectorAll('.search-result-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx+1) % items.length; updateActive(items); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = (activeIdx-1+items.length) % items.length; updateActive(items); }
  else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); items[activeIdx].click(); }
});

function updateActive(items) { items.forEach((el,i) => el.classList.toggle('active', i===activeIdx)); items[activeIdx]?.scrollIntoView({block:'nearest'}); }

function goToResult(entry) {
  closeSearch();
  if (entry.sectionId) document.getElementById(entry.sectionId)?.scrollIntoView({ behavior:'smooth', block:'start' });
  setTimeout(() => {
    const header = entry.element.querySelector('.accordion-header');
    if (header && !entry.element.classList.contains('open')) toggleAccordion(header);
    entry.element.style.boxShadow = '0 0 0 2px var(--green)';
    setTimeout(() => { entry.element.style.boxShadow = ''; }, 1200);
  }, 400);
}

function toggleAccordion(header) {
  const item = header.parentElement;
  const body = item.querySelector('.accordion-body');
  const isOpen = item.classList.contains('open');
  item.closest('.accordion').querySelectorAll('.accordion-item.open').forEach(o => {
    if (o !== item) { o.classList.remove('open'); o.querySelector('.accordion-body').style.maxHeight = null; }
  });
  if (isOpen) { item.classList.remove('open'); body.style.maxHeight = null; }
  else { item.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
}

function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' }); }

function openRelated(sectionId, itemIndex) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const items = section.querySelectorAll('.accordion-item');
  const item = items[itemIndex];
  if (!item) return;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    const header = item.querySelector('.accordion-header');
    if (header && !item.classList.contains('open')) toggleAccordion(header);
    item.style.boxShadow = '0 0 0 2px var(--green)';
    setTimeout(() => { item.style.boxShadow = ''; }, 1200);
  }, 400);
}
