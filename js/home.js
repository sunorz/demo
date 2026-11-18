const search = document.querySelector('#search');
const filters = document.querySelector('.filters');
const buttons = [...filters.querySelectorAll('button')];
const count = document.querySelector('.result-count');
const empty = document.querySelector('.empty');
const items = [...document.querySelectorAll('.demo-item')].map(element => ({
  element,
  tags: element.dataset.tags.split('|'),
  text: [
    element.querySelector('.index').textContent,
    element.querySelector('.card-title').textContent,
    element.querySelector('.version')?.textContent ?? '',
    ...element.dataset.tags.split('|'),
  ].join(' ').toLowerCase(),
}));

let activeFilter = buttons[0];

function updateResults() {
  const query = search.value.trim().toLowerCase();
  const tag = activeFilter.textContent;
  let visible = 0;

  for (const { element, tags, text } of items) {
    const matches = (activeFilter === buttons[0] || tags.includes(tag)) && text.includes(query);
    element.hidden = !matches;
    if (matches) visible++;
  }

  count.textContent = visible === items.length ? `共 ${items.length} 项` : `显示 ${visible} / ${items.length} 项`;
  empty.hidden = visible > 0;
}

function selectFilter(button) {
  activeFilter.setAttribute('aria-pressed', 'false');
  activeFilter = button;
  activeFilter.setAttribute('aria-pressed', 'true');
  updateResults();
}

for (const button of buttons) {
  button.addEventListener('click', () => selectFilter(button));
}

search.addEventListener('input', updateResults);
document.querySelector('.reset').addEventListener('click', () => {
  search.value = '';
  selectFilter(buttons[0]);
  search.focus();
});

search.closest('.search').hidden = false;
filters.hidden = false;
document.querySelector('#year').textContent = new Date().getFullYear();
updateResults();
