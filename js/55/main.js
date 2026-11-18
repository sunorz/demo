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
  wrench: icon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
  truncate: icon('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="13" y2="18"/><circle cx="16" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="22" cy="18" r="1.3" fill="currentColor" stroke="none"/>'),
  eye: icon('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  edit: icon('<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'),
  plus: icon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  endoc: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="12" y="17.5" text-anchor="middle" font-size="8" font-weight="700" fill="currentColor" stroke="none">EN</text>'),
  draft: icon('<path d="M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z"/>'),
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
const LS_KEY = 'storycms-demo-docs-v1';

function seedDocs() {
  return [
    {
      path: 'posts/story1.md',
      title: '雾桥',
      date: '2026-11-10',
      draft: false,
      body: '# 雾桥\n\n清晨五点，桥上的雾还没有散。守桥人老秦把登记簿摊在膝盖上，一笔一画地写下今天的日期——这是他退休前最后一个班。\n\n> 雾大的时候，人容易把心里的话说给桥听。\n\n第一个过桥的是个背画板的学生，鞋带散着，跑得满头是汗。老秦叫住他：**“慢些，桥面滑。”**学生回头笑了一下，那笑容让老秦想起四十年前的自己。\n\n登记簿的最后一页，记着一件他从没跟人提过的事[^1]。雾散之前，他把那一页轻轻撕了下来，叠好，放进口袋。\n\n[^1]: 1986 年的一个雾夜，有个陌生人替他值了半班，天亮前离开，没有留下名字。',
    },
    {
      path: 'posts/story1.en.md',
      title: 'The Fog Bridge',
      date: '2026-11-10',
      draft: false,
      body: '# The Fog Bridge\n\nAt five in the morning the fog on the bridge had not yet lifted. Old Qin, the bridge keeper, opened the register on his knees and wrote down the date, stroke by stroke — this was his last shift before retirement.\n\n> When the fog is thick, people tend to tell the bridge what is on their minds.\n\nThe first to cross was a student with a drawing board on his back, shoelaces undone, running and sweating. Qin called out: **"Slow down, the deck is slippery."** The student turned and smiled, and the smile reminded Qin of himself, forty years ago.\n\nOn the last page of the register was something he had never told anyone[^1]. Before the fog lifted, he tore the page out gently, folded it, and put it in his pocket.\n\n[^1]: On a foggy night in 1986, a stranger covered half his shift and left before dawn, without a name.',
    },
    {
      path: 'posts/story2.md',
      title: '未寄出的信',
      date: '2026-11-17',
      draft: true,
      body: '## 提纲\n\n- [x] 邮局旧址的外景\n- [ ] 退信柜里的第三格抽屉\n- [ ] 结尾那句不解释的告别\n\n## 人物\n\n| 人物 | 身份 | 备注 |\n| --- | --- | --- |\n| 林晚 | 邮递员 | 在职第 11 年 |\n| 陈默 | 寄件人 | 每年同一天来 |\n\n信封上的地址，是二十年前就拆掉的那条街。',
    },
  ];
}

let docs = [];
let activePath = null;

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ docs, activePath }));
  } catch { /* storage blocked: edits still work for this visit */ }
}

function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.docs)) {
        docs = data.docs;
        activePath = data.activePath;
        return;
      }
    }
  } catch { /* fall through to seeds */ }
  docs = seedDocs();
  activePath = docs[0].path;
  persist();
}

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const editor = $('editor');
const previewPane = $('previewPane');
const preview = $('preview');

function activeDoc() {
  return docs.find(d => d.path === activePath) || null;
}

function storyNum(path) {
  const m = path.match(/story(\d+)/);
  return m ? Number(m[1]) : 0;
}

function isEn(path) { return path.endsWith('.en.md'); }

function labelOf(path) {
  const base = path.split('/').pop().replace(/\.md$/i, '');
  const en = base.endsWith('.en');
  const stem = en ? base.slice(0, -3) : base;
  const name = stem.charAt(0).toUpperCase() + stem.slice(1);
  return name + (en ? '(en-US)' : '(zh-CN)');
}

function todayCst() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
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
  $('fmBar').style.display = has ? '' : 'none';
  $('statusbar').style.display = has ? '' : 'none';
  $('toolbarWrap').style.display = has ? '' : 'none';
  $('welcome').hidden = has;
  $('titleInput').disabled = !has;
  $('titleInput').value = has ? doc.title : '';
  $('fmDate').value = has ? doc.date : '';
  $('fmDate').max = todayCst();
  $('fmPath').textContent = has ? labelOf(doc.path) : '';
  $('fmDraft').hidden = !(has && doc.draft);
  $('publishBtn').hidden = !(has && doc.draft);
  if (has) setSaveLabel('已保存', false);
}

function openDoc(path) {
  activePath = path;
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

/* ---------- Drawer ---------- */
function renderDrawer() {
  const list = $('drawerList');
  list.innerHTML = '';
  const sorted = [...docs].sort((a, b) =>
    storyNum(b.path) - storyNum(a.path) || (isEn(a.path) ? 1 : 0) - (isEn(b.path) ? 1 : 0));
  if (!sorted.length) {
    const li = document.createElement('li');
    li.className = 'drawer-empty';
    li.textContent = '暂无文章';
    list.appendChild(li);
    return;
  }
  for (const doc of sorted) {
    const li = document.createElement('li');
    li.className = 'drawer-item' + (doc.path === activePath ? ' active' : '');
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'drawer-open';
    const name = document.createElement('span');
    name.className = 'doc-label';
    name.textContent = labelOf(doc.path);
    open.appendChild(name);
    if (doc.draft) {
      const d = document.createElement('span');
      d.className = 'doc-draft';
      d.title = '草稿';
      d.innerHTML = ICONS.draft;
      open.appendChild(d);
    }
    open.addEventListener('click', () => {
      openDoc(doc.path);
      $('drawerRoot').hidden = true;
    });
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'drawer-del';
    del.setAttribute('aria-label', '删除 ' + labelOf(doc.path));
    del.title = '删除';
    del.innerHTML = ICONS.trash;
    del.addEventListener('click', () => {
      if (!confirm('删除 ' + labelOf(doc.path) + '？')) return;
      docs = docs.filter(d => d.path !== doc.path);
      if (activePath === doc.path) activePath = docs.length ? docs[0].path : null;
      persist();
      if (activeDoc()) openDoc(activePath); else renderChrome();
      renderDrawer();
    });
    li.appendChild(open);
    li.appendChild(del);
    list.appendChild(li);
  }
}

/* ---------- Header actions ---------- */
function maxStoryNum() {
  return docs.reduce((m, d) => Math.max(m, storyNum(d.path)), 0);
}

function createDoc(path) {
  const doc = { path, title: '', date: todayCst(), draft: true, body: '' };
  docs.push(doc);
  persist();
  openDoc(path);
  renderDrawer();
  $('titleInput').focus();
  return doc;
}

function handleNew() {
  createDoc('posts/story' + (maxStoryNum() + 1) + '.md');
}

function handleNewEn() {
  const cur = activeDoc();
  let base = null;
  if (cur && !isEn(cur.path)) base = cur.path;
  else {
    const zh = docs.filter(d => !isEn(d.path)).sort((a, b) => storyNum(b.path) - storyNum(a.path))[0];
    if (zh) base = zh.path;
  }
  if (!base) { toast('先新建一篇文章，再添加英文版'); return; }
  const enPath = base.replace(/\.md$/, '.en.md');
  if (docs.some(d => d.path === enPath)) { toast('英文版已存在'); return; }
  createDoc(enPath);
}

function handlePublish() {
  const doc = activeDoc();
  if (!doc || !doc.draft) return;
  doc.draft = false;
  persist();
  renderChrome();
  renderDrawer();
  toast('已发布');
}

function handleBuild() {
  renderPreview();
  toast('生成完成（本机演示）');
}

function handleBuild25() {
  if (!docs.length) return;
  if (!confirm('生成 25% 会把全部文章正文截取到前 25%，并在文末加上解锁全文链接。继续？')) return;
  let changed = 0;
  for (const doc of docs) {
    if (doc.body.includes('trimmed')) continue;
    const total = doc.body.length;
    if (!total) continue;
    const target = Math.floor(total * 0.25);
    const lines = doc.body.split('\n');
    const kept = [];
    let acc = 0;
    for (const line of lines) {
      if (acc >= target && kept.length) break;
      kept.push(line);
      acc += line.length + 1;
    }
    const en = isEn(doc.path);
    doc.body = kept.join('\n').replace(/\n+$/, '') +
      (en ? '\n\n...\n\n[Unlock full text](/en/)' : '\n\n……\n\n[解锁全文](/)') +
      '\n\n<!-- trimmed -->';
    changed++;
  }
  persist();
  if (activeDoc()) { editor.value = activeDoc().body; renderPreview(); }
  toast(changed ? '已生成 25%（本机演示）' : '没有需要截取的文章');
}

/* ---------- Wiring ---------- */
function init() {
  $('menuBtn').innerHTML = ICONS.menu;
  $('buildBtn').innerHTML = ICONS.wrench;
  $('build25Btn').innerHTML = ICONS.truncate;
  $('newBtn').innerHTML = ICONS.plus;
  $('newEnBtn').innerHTML = ICONS.endoc;
  $('paneBtn').innerHTML = ICONS.eye;
  $('fmDraft').innerHTML = ICONS.draft;

  loadStore();
  renderToolbars();
  renderDrawer();
  if (activeDoc()) openDoc(activePath);
  else renderChrome();

  editor.addEventListener('input', syncFromEditor);
  editor.addEventListener('blur', () => { clearTimeout(saveTimer); persist(); if (activeDoc()) setSaveLabel('已保存 ' + formatClock(new Date()), false); });
  editor.addEventListener('scroll', () => {
    const maxTa = editor.scrollHeight - editor.clientHeight;
    const maxPv = previewPane.scrollHeight - previewPane.clientHeight;
    if (maxTa > 0 && maxPv > 0) previewPane.scrollTop = (editor.scrollTop / maxTa) * maxPv;
  });

  $('titleInput').addEventListener('input', (e) => {
    const doc = activeDoc();
    if (!doc) return;
    doc.title = e.target.value;
    markDirty();
  });
  $('fmDate').addEventListener('change', (e) => {
    const doc = activeDoc();
    if (!doc) return;
    if (e.target.value > todayCst()) { e.target.value = doc.date; return; }
    doc.date = e.target.value;
    markDirty();
  });

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
  $('newBtn').addEventListener('click', handleNew);
  $('newEnBtn').addEventListener('click', handleNewEn);
  $('welcomeNew').addEventListener('click', handleNew);
  $('publishBtn').addEventListener('click', handlePublish);
  $('buildBtn').addEventListener('click', handleBuild);
  $('build25Btn').addEventListener('click', handleBuild25);

  $('importBtn').addEventListener('click', () => $('importInput').click());
  $('importInput').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      let title = '', date = todayCst(), draft = true, body = text;
      const fm = text.match(/^---\n([\s\S]*?)\n---\n?/);
      if (fm) {
        body = text.slice(fm[0].length);
        const t = fm[1].match(/^title:\s*"?([^"\n]*)"?/m); if (t) title = t[1].trim();
        const d = fm[1].match(/^date:\s*(\d{4}-\d{2}-\d{2})/m); if (d) date = d[1];
        draft = !/^draft:\s*false/m.test(fm[1]);
      }
      const doc = { path: 'posts/story' + (maxStoryNum() + 1) + '.md', title, date, draft, body };
      docs.push(doc);
      persist();
      openDoc(doc.path);
      renderDrawer();
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
