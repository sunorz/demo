'use strict';
/* Story CMS editor replica — vanilla JS, local data only.
   Documents live in localStorage; nothing is sent over the network.
   The toolbar behaviours (wrap / prefix / paragraph break / footnote)
   mirror the CMS editor's own implementations. */

/* ---------- Icons (24px stroke set used by the CMS editor) ---------- */
function icon(inner) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
}
const ICONS = {
  menu: icon('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),
  eye: icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  edit: icon('<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'),
  plus: icon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  download: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
  home: icon('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  trash: icon('<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
  bold: icon('<path d="M6 4h8a4 4 0 0 1 0 8H6z"/><path d="M6 12h9a4 4 0 0 1 0 8H6z"/>'),
  italic: icon('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
  list: icon('<line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><line x1="4" y1="6" x2="4.01" y2="6"/><line x1="4" y1="12" x2="4.01" y2="12"/><line x1="4" y1="18" x2="4.01" y2="18"/>'),
  listOrdered: icon('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 3.5 5.5 2.8V6"/><path d="M3.8 10.2c.6-.8 2.2-.6 2.2.4 0 .9-1.3 1.3-2.2 2h2.4"/><path d="M3.9 16.4c.5-.5 2-.4 2 .5 0 .7-.8 1-1.4.9.7-.1 1.6.2 1.6 1 0 .9-1.7 1-2.3.4"/>'),
  quote: icon('<path fill="currentColor" stroke="none" d="M10.2 7.6C7.3 8.5 5.4 10.9 5.4 14v2.4h4.9v-6H7.9c.2-1.2 1-2 2.3-2.4V7.6zm9 0c-2.9.9-4.8 3.3-4.8 6.4v2.4h4.9v-6h-2.4c.2-1.2 1-2 2.3-2.4V7.6z"/>'),
  pilcrow: icon('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>'),
  footnote: icon('<g transform="scale(1.2)"><path fill="currentColor" stroke="none" d="M18 3.5a.5.5 0 0 0-1 0c0 .467-.103.839-.3 1.167c-.2.334-.516.65-.985.977a.5.5 0 1 0 .57.821q.399-.275.715-.584V9.5a.5.5 0 0 0 1 0zm-7.507 11.542q.225-.001.371-.146a.5.5 0 0 0 .146-.372v-.663h.024q.316.56.846.87q.536.31 1.217.31q1.218 0 1.954-.888q.736-.894.736-2.385q0-1.485-.736-2.38t-1.935-.894q-.664 0-1.2.31a2.23 2.23 0 0 0-.833.858h-.024V6.608a.56.56 0 0 0-.152-.408a.5.5 0 0 0-.378-.158a.5.5 0 0 0-.383.158a.58.58 0 0 0-.146.408v7.916q0 .232.134.378q.134.14.359.14m3.724-1.558q-.487.627-1.327.627q-.81 0-1.326-.645q-.51-.645-.511-1.698q0-1.047.51-1.692q.519-.651 1.327-.651q.84 0 1.327.633t.487 1.71q0 1.083-.487 1.716M2.159 14.865q.165.135.412.135q.406 0 .558-.422l.806-2.19h3.623l.813 2.19q.152.422.558.422q.247 0 .406-.135a.44.44 0 0 0 .165-.348a.9.9 0 0 0-.07-.306L6.48 6.526Q6.276 6 5.763 6q-.546 0-.749.532L2.07 14.211a.9.9 0 0 0-.07.306q0 .208.159.348m5.076-3.414h-2.97l1.466-4.025h.038z"/></g>'),
  swap: icon('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'),
  link: icon('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
};

/* ---------- A small vanilla Markdown renderer ---------- */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInline(text, nums) {
  const codes = [];
  text = text.replace(/`([^`\n]+)`/g, (m, c) => {
    codes.push(c);
    return '\u0000' + (codes.length - 1) + '\u0000';
  });
  text = escapeHtml(text);
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (m, alt, src, title) => '<img src="' + src + '" alt="' + alt + '"' + (title ? ' title="' + title + '"' : '') + '>');
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (m, t, href, title) => '<a href="' + href + '"' + (title ? ' title="' + title + '"' : '') + '>' + t + '</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  text = text.replace(/\[\^([^\]]+)\]/g, (m, label) => {
    const n = nums.get(label);
    if (n == null) return m;
    return '<sup class="footnote-ref" id="fnref-' + label + '"><a href="#fn-' + label + '">[' + n + ']</a></sup>';
  });
  text = text.replace(/\u0000(\d+)\u0000/g, (m, i) => '<code>' + escapeHtml(codes[+i]) + '</code>');
  return text;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

function isTableSep(line) {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes('-');
}

function renderList(lines, start, nums) {
  // Parse one list block beginning at lines[start]; returns {html, next}.
  const first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const startNum = ordered ? parseInt(first[2], 10) : null;
  let html = ordered ? '<ol start="' + startNum + '">' : '<ul>';
  let i = start;
  while (i < lines.length) {
    const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (!m) break;
    const indent = m[1].length;
    if (indent < baseIndent) break;
    if (indent > baseIndent) {
      // Nested list belonging to the previous item.
      const sub = renderList(lines, i, nums);
      html = html.replace(/<\/li>$/, '') + sub.html + '</li>';
      i = sub.next;
      continue;
    }
    let content = m[3];
    let cls = '';
    let prefix = '';
    const task = content.match(/^\[([ xX])\]\s+(.*)$/);
    if (task) {
      cls = ' class="task-list-item"';
      prefix = '<input type="checkbox" disabled' + (task[1].toLowerCase() === 'x' ? ' checked' : '') + '>';
      content = task[2];
    }
    html += '<li' + cls + '>' + prefix + renderInline(content, nums) + '</li>';
    i++;
  }
  html += ordered ? '</ol>' : '</ul>';
  return { html, next: i };
}

function renderBlocks(lines, nums) {
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      html += '<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>';
      continue;
    }

    const head = line.match(/^(#{1,6})\s+(.*)$/);
    if (head) {
      const level = head[1].length;
      html += '<h' + level + '>' + renderInline(head[2], nums) + '</h' + level + '>';
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { html += '<hr>'; i++; continue; }

    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map(c =>
        c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left');
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const cell = (tag, txt, a) =>
        '<' + tag + (a && a !== 'left' ? ' style="text-align:' + a + '"' : '') + '>' +
        renderInline(txt, nums) + '</' + tag + '>';
      html += '<table><thead><tr>' + header.map((c, k) => cell('th', c, aligns[k])).join('') +
        '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + header.map((_, k) => cell('td', r[k] || '', aligns[k])).join('') + '</tr>').join('') +
        '</tbody></table>';
      continue;
    }

    if (/^\s*>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      html += '<blockquote>' + renderBlocks(buf, nums) + '</blockquote>';
      continue;
    }

    if (/^(\s*)([-*+]|\d+[.)])\s+/.test(line)) {
      const list = renderList(lines, i, nums);
      html += list.html;
      i = list.next;
      continue;
    }

    // Paragraph: gather until a blank line or another block starts.
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(#{1,6})\s/.test(lines[i]) && !/^```/.test(lines[i]) &&
           !/^\s*>/.test(lines[i]) && !/^(\s*)([-*+]|\d+[.)])\s+/.test(lines[i]) &&
           !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) {
      buf.push(lines[i]);
      i++;
    }
    html += '<p>' + renderInline(buf.join('\n'), nums) + '</p>';
  }
  return html;
}

function renderMarkdown(src) {
  const defs = new Map();
  const bodyLines = [];
  for (const line of src.split('\n')) {
    const m = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if (m) defs.set(m[1], m[2]);
    else bodyLines.push(line);
  }
  const order = [];
  for (const m of bodyLines.join('\n').matchAll(/\[\^([^\]]+)\]/g)) {
    if (defs.has(m[1]) && !order.includes(m[1])) order.push(m[1]);
  }
  const nums = new Map(order.map((label, i) => [label, i + 1]));
  let html = renderBlocks(bodyLines, nums);
  if (order.length) {
    html += '<section class="footnotes"><hr><ol class="footnotes-list">' +
      order.map(label =>
        '<li id="fn-' + label + '">' + renderInline(defs.get(label), nums) +
        ' <a href="#fnref-' + label + '" class="footnote-backref" aria-label="回到正文">&#8617;</a></li>').join('') +
      '</ol></section>';
  }
  return html;
}


/* ---------- Document store (localStorage only) ---------- */
const LS_KEY = 'md-editor-demo-docs-v2';

let docs = []; // [{name, body}] — plain local documents, no front matter
let activeName = null;

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ docs, activeName }));
  } catch { /* storage blocked: edits still work for this visit */ }
}

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.docs)) {
        docs = data.docs.filter(d => d && typeof d.name === 'string' && typeof d.body === 'string');
        activeName = data.activeName;
      }
    }
  } catch { /* start empty */ }
  if (!docs.some(d => d.name === activeName)) {
    activeName = docs.length ? docs[0].name : null;
  }
}

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const editor = $('editor');
const previewPane = $('previewPane');
const preview = $('preview');
const nameInput = $('titleInput');

function activeDoc() {
  return docs.find(d => d.name === activeName) || null;
}

function uniqueName(base) {
  if (!docs.some(d => d.name === base)) return base;
  for (let i = 2; ; i++) {
    const candidate = base + '-' + i;
    if (!docs.some(d => d.name === candidate)) return candidate;
  }
}

function sanitizeName(raw) {
  return raw.trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
}

function formatClock(d) {
  const p = (n) => String(n).padStart(2, '0');
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

let toastTimer = null;
function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2200);
}

/* ---------- Save state ---------- */
let saveTimer = null;
function setSaveLabel(text, isError) {
  for (const id of ['saveLabel', 'saveLabelMini']) {
    const el = $(id);
    el.textContent = text;
    el.classList.toggle('error', !!isError);
  }
}
function markDirty() {
  if (!activeDoc()) return;
  setSaveLabel('未保存', false);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    persist();
    setSaveLabel('已保存 ' + formatClock(new Date()), false);
  }, 700);
}

/* ---------- Rendering ---------- */
function renderPreview() {
  const doc = activeDoc();
  const body = doc ? doc.body : '';
  if (!body.trim()) {
    preview.innerHTML = '<p class="preview-empty">预览会显示在这里。</p>';
  } else {
    preview.innerHTML = renderMarkdown(body);
  }
  $('charCount').textContent = [...body].length + ' 字';
  $('lineCount').textContent = (body ? body.split('\n').length : 0) + ' 行';
}

function renderChrome() {
  const doc = activeDoc();
  const has = !!doc;
  $('panes').style.display = has ? '' : 'none';
  $('statusbar').style.display = has ? '' : 'none';
  $('toolbarWrap').style.display = has ? '' : 'none';
  $('welcome').hidden = has;
  nameInput.disabled = !has;
  nameInput.value = has ? doc.name : '';
  if (has) setSaveLabel('已保存', false);
}

function openDoc(name) {
  activeName = name;
  const doc = activeDoc();
  editor.value = doc ? doc.body : '';
  renderChrome();
  renderPreview();
  persist();
}

/* ---------- Editor edit plumbing ---------- */
function syncFromEditor() {
  const doc = activeDoc();
  if (!doc) return;
  doc.body = editor.value;
  renderPreview();
  markDirty();
}

function applyEdit(next, selStart, selEnd) {
  editor.value = next;
  editor.focus();
  editor.setSelectionRange(selStart, selEnd);
  syncFromEditor();
}

/* Toolbar behaviours — ports of the CMS editor's own functions. */
function wrapSelection(before, after, placeholder) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const content = editor.value;
  const selected = content.slice(start, end) || placeholder;
  const next = content.slice(0, start) + before + selected + after + content.slice(end);
  applyEdit(next, start + before.length, start + before.length + selected.length);
}

function prefixLines(prefix) {
  const content = editor.value;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const lineStart = content.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = content.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = content.length;
  const lines = content.slice(lineStart, lineEnd).split('\n');
  const done = lines.map((line, i) =>
    typeof prefix === 'function' ? prefix(i) + line : prefix + line);
  const nextBlock = done.join('\n');
  const next = content.slice(0, lineStart) + nextBlock + content.slice(lineEnd);
  applyEdit(next, lineStart, lineStart + nextBlock.length);
}

function insertParagraphBreakAtCursor() {
  const content = editor.value;
  const cursor = editor.selectionStart;
  const before = content.slice(0, cursor).replace(/\n+$/, '');
  const after = content.slice(cursor);
  applyEdit(before + '\n\n' + after, before.length + 2, before.length + 2);
}

function insertFootnoteAtCursor() {
  const content = editor.value;
  const cursor = editor.selectionStart;
  let max = 0;
  for (const m of content.matchAll(/\[\^(\d+)\]/g)) {
    const n = Number(m[1]);
    if (n > max) max = n;
  }
  const n = max + 1;
  const withRef = content.slice(0, cursor) + '[^' + n + ']' + content.slice(cursor);
  const body = withRef.replace(/\n+$/, '');
  const next = body + '\n\n[^' + n + ']: ';
  applyEdit(next, next.length, next.length);
}

/* ---------- Capsule toolbar ---------- */
const TOOLS = [
  { key: 'bold', label: '加粗', icon: ICONS.bold, action: () => wrapSelection('**', '**', '粗体') },
  { key: 'italic', label: '斜体', icon: ICONS.italic, sepAfter: true, action: () => wrapSelection('*', '*', '斜体') },
  { key: 'ul', label: '无序列表', icon: ICONS.list, action: () => prefixLines('- ') },
  { key: 'ol', label: '有序列表', icon: ICONS.listOrdered, action: () => prefixLines((i) => (i + 1) + '. ') },
  { key: 'quote', label: '引用', icon: ICONS.quote, action: () => prefixLines('> ') },
  { key: 'paragraph', label: '分段', icon: ICONS.pilcrow, sepAfter: true, action: insertParagraphBreakAtCursor },
  { key: 'link', label: '插入链接', icon: ICONS.link, action: () => wrapSelection('[', '](https://)', '链接文字') },
  { key: 'footnote', label: '脚注', icon: ICONS.footnote, action: insertFootnoteAtCursor },
];
let toolPage = 0;

function toolButton(t) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tool-btn';
  b.setAttribute('aria-label', t.label);
  b.title = t.label;
  b.innerHTML = t.icon;
  b.addEventListener('mousedown', (e) => e.preventDefault());
  b.addEventListener('click', t.action);
  return b;
}
function sepEl() {
  const s = document.createElement('span');
  s.className = 'sep';
  return s;
}
function renderToolbars() {
  const desktop = $('capsuleDesktop');
  desktop.innerHTML = '';
  TOOLS.forEach((t, i) => {
    desktop.appendChild(toolButton(t));
    if (t.sepAfter && i < TOOLS.length - 1) desktop.appendChild(sepEl());
  });
  const mobile = $('capsuleMobile');
  mobile.innerHTML = '';
  const half = Math.ceil(TOOLS.length / 2);
  const group = toolPage === 0 ? TOOLS.slice(0, half) : TOOLS.slice(half);
  group.forEach((t, i) => {
    mobile.appendChild(toolButton(t));
    if (t.sepAfter && i < group.length - 1) mobile.appendChild(sepEl());
  });
  mobile.appendChild(sepEl());
  const sw = document.createElement('button');
  sw.type = 'button';
  sw.className = 'tool-btn switch-btn';
  sw.setAttribute('aria-label', toolPage === 0 ? '切换到第二组工具' : '切换到第一组工具');
  sw.title = sw.getAttribute('aria-label');
  sw.innerHTML = ICONS.swap;
  sw.addEventListener('mousedown', (e) => e.preventDefault());
  sw.addEventListener('click', () => { toolPage = toolPage === 0 ? 1 : 0; renderToolbars(); });
  mobile.appendChild(sw);
}

/* ---------- Drawer (document list) ---------- */
function renderDrawer() {
  const list = $('drawerList');
  list.innerHTML = '';
  if (!docs.length) {
    const li = document.createElement('li');
    li.className = 'drawer-empty';
    li.textContent = '暂无文档';
    list.appendChild(li);
    return;
  }
  for (const doc of docs) {
    const li = document.createElement('li');
    li.className = 'drawer-item' + (doc.name === activeName ? ' active' : '');
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'drawer-open';
    const name = document.createElement('span');
    name.className = 'doc-label';
    name.textContent = doc.name + '.md';
    open.appendChild(name);
    open.addEventListener('click', () => {
      openDoc(doc.name);
      $('drawerRoot').hidden = true;
    });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'drawer-del';
    del.setAttribute('aria-label', '删除 ' + doc.name);
    del.title = '删除';
    del.innerHTML = ICONS.trash;
    del.addEventListener('click', () => {
      if (!confirm('删除 ' + doc.name + '.md？')) return;
      docs = docs.filter(d => d.name !== doc.name);
      if (activeName === doc.name) activeName = docs.length ? docs[0].name : null;
      persist();
      if (activeDoc()) openDoc(activeName); else renderChrome();
      renderDrawer();
    });
    li.appendChild(open);
    li.appendChild(del);
    list.appendChild(li);
  }
}

/* ---------- Create / rename / import ---------- */
function createDoc() {
  const doc = { name: uniqueName('untitled'), body: '' };
  docs.push(doc);
  persist();
  openDoc(doc.name);
  renderDrawer();
  editor.focus();
}

function commitRename() {
  const doc = activeDoc();
  if (!doc) return;
  let n = sanitizeName(doc.name) || 'untitled';
  if (docs.some(d => d !== doc && d.name === n)) n = uniqueName(n);
  doc.name = n;
  activeName = n;
  nameInput.value = n;
  persist();
  renderDrawer();
}

/* ---------- Export: .md / HTML / PDF ---------- */
const EXPORT_CSS = [
  'body{margin:0;background:#fff;color:#1a1815}',
  '.md-preview{max-width:760px;margin:0 auto;padding:32px 20px 64px;font-family:Georgia,"Noto Serif SC","Songti SC","STSong",serif;font-size:16px;line-height:1.75;overflow-wrap:break-word}',
  '.md-preview>*:first-child{margin-top:0}',
  '.md-preview h1,.md-preview h2,.md-preview h3,.md-preview h4,.md-preview h5,.md-preview h6{font-weight:700;line-height:1.35;margin:1.4em 0 .55em}',
  '.md-preview h1{font-size:1.75em;padding-bottom:.3em;border-bottom:1px solid #ddd8cc}',
  '.md-preview h2{font-size:1.45em;padding-bottom:.25em;border-bottom:1px solid #ddd8cc}',
  '.md-preview h3{font-size:1.22em}.md-preview h4{font-size:1.05em}',
  '.md-preview p{margin:.7em 0}',
  '.md-preview a{color:#c8401f;text-decoration:underline;text-underline-offset:3px}',
  '.md-preview ul,.md-preview ol{margin:.7em 0;padding-left:1.6em}',
  '.md-preview li{margin:.25em 0}',
  '.md-preview blockquote{margin:.9em 0;padding:.15em 0 .15em 1em;border-left:3px solid #c8401f;color:#6f6a61}',
  '.md-preview code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.86em;background:#efede6;padding:.12em .35em;border-radius:4px}',
  '.md-preview pre{background:#efede6;border:1px solid #ddd8cc;border-radius:8px;padding:.9em 1em;overflow-x:auto;line-height:1.55}',
  '.md-preview pre code{background:transparent;padding:0}',
  '.md-preview hr{border:none;border-top:1px solid #ddd8cc;margin:1.6em 0}',
  '.md-preview table{border-collapse:collapse;margin:.9em 0;display:block;overflow-x:auto;max-width:100%}',
  '.md-preview th,.md-preview td{border:1px solid #ddd8cc;padding:.45em .8em;text-align:left;font-size:.92em}',
  '.md-preview th{background:#efede6;font-weight:700}',
  '.md-preview img{max-width:100%;height:auto;border-radius:8px}',
  '.md-preview input[type="checkbox"]{margin-right:.45em;accent-color:#c8401f}',
  '.md-preview .footnotes{font-size:.88em;color:#6f6a61;margin-top:1.4em}',
  '.md-preview .footnote-ref{font-size:.85em}',
  '.md-preview li.task-list-item{list-style:none}',
  '@media print{.md-preview{max-width:none}}',
].join('\n');

function standaloneHtml(doc, forPrint) {
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<title>' +
    escapeHtml(doc.name) + '</title>\n<style>\n' + EXPORT_CSS + '\n</style>\n</head>\n<body>\n' +
    '<article class="md-preview">' + renderMarkdown(doc.body) + '</article>\n' +
    (forPrint ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},100)})<\/script>\n' : '') +
    '</body>\n</html>';
}

function downloadFile(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function doExport(kind) {
  const doc = activeDoc();
  if (!doc) return;
  const base = sanitizeName(doc.name) || 'untitled';
  if (kind === 'md') {
    downloadFile(base + '.md', doc.body, 'text/markdown;charset=utf-8');
    toast('已导出 ' + base + '.md');
  } else if (kind === 'html') {
    downloadFile(base + '.html', standaloneHtml(doc, false), 'text/html;charset=utf-8');
    toast('已导出 ' + base + '.html');
  } else if (kind === 'pdf') {
    const w = window.open('', '_blank');
    if (!w) {
      downloadFile(base + '.html', standaloneHtml(doc, false), 'text/html;charset=utf-8');
      toast('弹窗被拦截，已改为下载 HTML');
      return;
    }
    w.document.open();
    w.document.write(standaloneHtml(doc, true));
    w.document.close();
    toast('在打印对话框里选择「另存为 PDF」');
  }
}

/* ---------- Wiring ---------- */
function init() {
  $('menuBtn').innerHTML = ICONS.menu;
  $('newBtn').innerHTML = ICONS.plus;
  $('paneBtn').innerHTML = ICONS.eye;
  $('exportBtn').innerHTML = ICONS.download;
  $('back-home-link').innerHTML = ICONS.home;

  loadStore();
  renderToolbars();
  renderDrawer();
  if (activeDoc()) openDoc(activeName);
  else renderChrome();

  editor.addEventListener('input', syncFromEditor);
  editor.addEventListener('blur', () => {
    clearTimeout(saveTimer);
    persist();
    if (activeDoc()) setSaveLabel('已保存 ' + formatClock(new Date()), false);
  });
  editor.addEventListener('scroll', () => {
    const maxTa = editor.scrollHeight - editor.clientHeight;
    const maxPv = previewPane.scrollHeight - previewPane.clientHeight;
    if (maxTa > 0 && maxPv > 0) previewPane.scrollTop = (editor.scrollTop / maxTa) * maxPv;
  });

  nameInput.addEventListener('input', () => {
    const doc = activeDoc();
    if (!doc) return;
    doc.name = nameInput.value;
    activeName = doc.name;
    markDirty();
  });
  nameInput.addEventListener('blur', commitRename);

  $('paneBtn').addEventListener('click', () => {
    const app = $('app');
    const toPreview = !app.classList.contains('mode-preview');
    app.classList.toggle('mode-preview', toPreview);
    app.classList.toggle('mode-edit', !toPreview);
    app.classList.remove('mode-split');
    $('paneBtn').innerHTML = toPreview ? ICONS.edit : ICONS.eye;
    $('paneBtn').setAttribute('aria-label', toPreview ? '编辑' : '预览');
    $('paneBtn').title = toPreview ? '编辑' : '预览';
    $('paneBtn').setAttribute('aria-pressed', String(toPreview));
  });

  $('menuBtn').addEventListener('click', () => { renderDrawer(); $('drawerRoot').hidden = false; });
  $('drawerBackdrop').addEventListener('click', () => { $('drawerRoot').hidden = true; });
  $('newBtn').addEventListener('click', createDoc);
  $('welcomeNew').addEventListener('click', createDoc);

  const exportMenu = $('exportMenu');
  $('exportBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const open = exportMenu.hidden;
    exportMenu.hidden = !open;
    $('exportBtn').setAttribute('aria-expanded', String(open));
  });
  exportMenu.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-export]');
    if (!btn) return;
    exportMenu.hidden = true;
    $('exportBtn').setAttribute('aria-expanded', 'false');
    doExport(btn.getAttribute('data-export'));
  });
  document.addEventListener('click', (e) => {
    if (!exportMenu.hidden && !e.target.closest('.export-wrap')) {
      exportMenu.hidden = true;
      $('exportBtn').setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exportMenu.hidden = true;
  });

  $('importBtn').addEventListener('click', () => $('importInput').click());
  $('importInput').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      // Imported files are plain documents: any front matter block is
      // dropped instead of being shown in the editor.
      const body = text.replace(/^---\n[\s\S]*?\n---\n?/, '');
      const stem = sanitizeName(file.name.replace(/\.md$/i, '')) || 'untitled';
      const doc = { name: uniqueName(stem), body };
      docs.push(doc);
      persist();
      openDoc(doc.name);
      renderDrawer();
      $('drawerRoot').hidden = true;
      toast('已导入 ' + file.name);
    });
  });

  if (window.visualViewport) {
    const onVv = () => {
      const inset = window.innerHeight - window.visualViewport.height;
      $('toolbarWrap').style.bottom = inset > 60 ? (inset + 10) + 'px' : '';
    };
    window.visualViewport.addEventListener('resize', onVv);
  }
}

init();
