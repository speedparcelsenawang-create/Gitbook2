/* =========================================================
   DocBook — a lightweight GitBook-style docs app
   Data model, persisted in localStorage, no backend needed.
   ========================================================= */
import '../css/style.css';
import 'lightgallery.js/dist/css/lightgallery.css';
import 'lightgallery.js/dist/js/lightgallery.js';
import { marked } from 'marked';
import { DEFAULT_BOOK_TITLE, normalizeBookTitle, normalizeDocumentState } from '../src/data-store.js';

const STORAGE_KEY = 'docbook_data_v1';
const THEME_KEY = 'docbook_theme';
const EDIT_KEY = 'docbook_edit_mode';
const SIDEBAR_KEY = 'docbook_sidebar_collapsed';
const LANG_KEY = 'docbook_language';

const translations = {
  ms: {
    settings: 'Tetapan',
    general: 'Umum',
    appearance: 'Penampilan',
    generalDescription: 'Urus identiti dan bahasa RecipeBook anda.',
    appearanceDescription: 'Sesuaikan rupa dan cara anda menggunakan RecipeBook.',
    languageDescription: 'Pilih bahasa yang digunakan dalam antara muka.',
    bookTitleDescription: 'Nama ini dipaparkan pada penjuru kiri atas.',
    editModeDescription: 'Tunjukkan kawalan untuk menyunting kandungan dan menu.',
    themeDescription: 'Pilih tema yang selesa untuk digunakan.',
    language: 'Bahasa',
    bookTitle: 'Nama RecipeBook',
    theme: 'Tema',
    editMode: 'Mod edit',
    light: 'Terang',
    dark: 'Gelap',
    close: 'Tutup',
    cancel: 'Batal',
    delete: 'Padam',
    ok: 'OK',
    save: 'Simpan',
    searchPlaceholder: 'Cari dokumen…',
    addMenu: 'Tambah Menu',
    addSubmenu: 'Tambah Submenu',
    rename: 'Namakan semula',
    moveUp: 'Alih ke atas',
    moveDown: 'Alih ke bawah',
    duplicate: 'Duplikasi',
    deleteNode: 'Padam',
    confirmAction: 'Sahkan Tindakan',
    noPageSelected: 'Tiada halaman dipilih',
    noPageSelectedHint: 'Pilih halaman dari sidebar, atau tambah menu baharu dalam Edit Mode.',
    editContent: 'Edit Kandungan',
    lastUpdated: 'Terakhir dikemas kini secara tempatan',
    prev: 'Sebelumnya',
    next: 'Seterusnya',
    markdownSupported: 'Markdown disokong',
    title: 'Tajuk',
    bold: 'Tebal',
    italic: 'Italik',
    list: 'Senarai',
    checklist: 'Checklist',
    link: 'Pautan',
    code: 'Kod',
    table: 'Jadual',
    tip: 'Tip',
    info: 'Info',
    note: 'Note',
    warning: 'Warning',
    important: 'Important',
    success: 'Success',
    danger: 'Danger',
    quote: 'Quote',
    uploadMedia: 'Muat naik gambar/video',
    preview: 'Preview',
    backToEditor: 'Kembali ke editor',
    seeMore: 'Lihat lagi',
    seeLess: 'Lihat kurang',
    copy: 'Salin',
    copied: 'Disalin'
  },
  en: {
    settings: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    generalDescription: 'Manage your RecipeBook identity and language.',
    appearanceDescription: 'Customize how your RecipeBook looks and feels.',
    languageDescription: 'Choose the language used across the interface.',
    bookTitleDescription: 'This name appears in the top-left corner.',
    editModeDescription: 'Show controls for editing content and navigation.',
    themeDescription: 'Choose a theme that feels comfortable to use.',
    language: 'Language',
    bookTitle: 'RecipeBook name',
    theme: 'Theme',
    editMode: 'Edit mode',
    light: 'Light',
    dark: 'Dark',
    close: 'Close',
    cancel: 'Cancel',
    delete: 'Delete',
    ok: 'OK',
    save: 'Save',
    searchPlaceholder: 'Search documents…',
    addMenu: 'Add Menu',
    addSubmenu: 'Add Submenu',
    rename: 'Rename',
    moveUp: 'Move up',
    moveDown: 'Move down',
    duplicate: 'Duplicate',
    deleteNode: 'Delete',
    confirmAction: 'Confirm Action',
    noPageSelected: 'No page selected',
    noPageSelectedHint: 'Choose a page from the sidebar, or add a new menu in Edit Mode.',
    editContent: 'Edit Content',
    lastUpdated: 'Last updated locally',
    prev: 'Previous',
    next: 'Next',
    markdownSupported: 'Markdown supported',
    title: 'Title',
    bold: 'Bold',
    italic: 'Italic',
    list: 'List',
    checklist: 'Checklist',
    link: 'Link',
    code: 'Code',
    table: 'Table',
    tip: 'Tip',
    info: 'Info',
    note: 'Note',
    warning: 'Warning',
    important: 'Important',
    success: 'Success',
    danger: 'Danger',
    quote: 'Quote',
    uploadMedia: 'Upload image/video',
    preview: 'Preview',
    backToEditor: 'Back to editor',
    seeMore: 'See more',
    seeLess: 'See less',
    copy: 'Copy',
    copied: 'Copied'
  }
};

let state = {
  activeId: null,
  pages: [], // tree: { id, title, content, children: [] }
  bookTitle: DEFAULT_BOOK_TITLE
};

/* ---------- Default seed content ---------- */
function seedData() {
  return [
    {
      id: uid(), title: 'Pengenalan', children: [],
      content: `# Selamat Datang 👋

Ini adalah **DocBook**, sistem dokumentasi moden bergaya GitBook.

- Klik **Edit Mode** di penjuru atas untuk mula menyunting
- Guna butang **+** pada sidebar untuk tambah menu / submenu
- Tulis kandungan dalam format **Markdown**

> Semua perubahan disimpan automatik pada pelayar anda (localStorage).`
    },
    {
      id: uid(), title: 'Panduan Bermula', children: [
        {
          id: uid(), title: 'Pasang', children: [],
          content: `## Pasang DocBook\n\nTiada pemasangan diperlukan — cuma buka \`index.html\` dalam pelayar.`
        },
        {
          id: uid(), title: 'Konfigurasi', children: [],
          content: `## Konfigurasi\n\nUbah suai struktur menu terus dari sidebar semasa **Edit Mode** aktif.`
        }
      ],
      content: `# Panduan Bermula\n\nBahagian ini mengandungi submenu untuk membantu anda bermula.`
    },
    {
      id: uid(), title: 'Rujukan API', children: [],
      content: `# Rujukan API\n\n\`\`\`js\nfunction hello() {\n  console.log("Hello DocBook!");\n}\n\`\`\``
    }
  ];
}

function uid() {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

/* ---------- Persistence ---------- */
async function loadState() {
  try {
    const response = await fetch('/api/docbook', {
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      const parsed = await response.json();
      const normalized = normalizeDocumentState(parsed);
      state.pages = normalized.pages;
      state.activeId = normalized.activeId;
      return;
    }
  } catch (error) {
    console.warn('Database API unavailable, falling back to localStorage.', error);
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeDocumentState(parsed);
      state.pages = normalized.pages;
      state.activeId = normalized.activeId;
      state.bookTitle = normalized.bookTitle;
      return;
    } catch (error) {
      console.warn('Invalid local state, rebuilding default data.', error);
    }
  }

  const normalized = normalizeDocumentState({ pages: null, activeId: null, bookTitle: null });
  state.pages = normalized.pages;
  state.activeId = normalized.activeId;
  state.bookTitle = normalized.bookTitle;
  saveState();
}

function saveState() {
  const payload = {
    pages: state.pages,
    activeId: state.activeId,
    bookTitle: normalizeBookTitle(state.bookTitle)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  fetch('/api/docbook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).catch(() => {
    // Ignore remote save failures and keep local fallback working.
  });
}

/* ---------- Tree helpers ---------- */
function findNode(id, nodes = state.pages) {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(id, n.children);
    if (found) return found;
  }
  return null;
}

function findParentArray(id, nodes = state.pages) {
  for (const n of nodes) {
    if (n.id === id) return nodes;
    const found = findParentArray(id, n.children);
    if (found) return found;
  }
  return null;
}

function findPath(id, nodes = state.pages, path = []) {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.id === id) return nextPath;
    const found = findPath(id, node.children, nextPath);
    if (found) return found;
  }
  return null;
}

function removeNode(id) {
  const arr = findParentArray(id);
  if (!arr) return;
  const idx = arr.findIndex(n => n.id === id);
  if (idx !== -1) arr.splice(idx, 1);
}

function flattenSearch(nodes = state.pages, out = []) {
  for (const n of nodes) {
    out.push(n);
    flattenSearch(n.children, out);
  }
  return out;
}

function duplicateNode(node) {
  return {
    id: uid(),
    title: `${node.title} (salinan)`,
    content: node.content || '',
    children: node.children.map(duplicateNode)
  };
}

function moveNode(id, direction) {
  const siblings = findParentArray(id);
  if (!siblings) return;
  const index = siblings.findIndex(node => node.id === id);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) return;
  [siblings[index], siblings[targetIndex]] = [siblings[targetIndex], siblings[index]];
  saveState();
  renderTree();
}

/* ---------- DOM refs ---------- */
const menuTreeEl = document.getElementById('menuTree');
const contentEl = document.getElementById('content');
const tplTreeItem = document.getElementById('tpl-tree-item');
const sidebarEl = document.getElementById('sidebar');
const searchInput = document.getElementById('searchInput');

/* ---------- Rendering: sidebar tree ---------- */
function renderTree() {
  menuTreeEl.innerHTML = '';
  state.pages.forEach(node => menuTreeEl.appendChild(renderTreeNode(node)));
}

function renderTreeNode(node) {
  const frag = tplTreeItem.content.cloneNode(true);
  const item = frag.querySelector('.tree-item');
  const row = frag.querySelector('.tree-row');
  const label = frag.querySelector('.tree-label');
  const childrenEl = frag.querySelector('.tree-children');
  const caret = frag.querySelector('.toggle-caret');

  item.dataset.id = node.id;
  label.textContent = node.title;
  if (node.id === state.activeId) row.classList.add('active');
  if (!node.children.length) item.classList.add('no-children');
  if (node._expanded) item.classList.add('expanded');

  node.children.forEach(child => childrenEl.appendChild(renderTreeNode(child)));

  caret.addEventListener('click', (e) => {
    e.stopPropagation();
    node._expanded = !node._expanded;
    renderTree();
  });

  row.addEventListener('click', () => {
    state.activeId = node.id;
    node._expanded = true;
    saveState();
    renderTree();
    renderContent();
  });

  frag.querySelector('.act-add-child').setAttribute('title', getText('addSubmenu'));
  frag.querySelector('.act-add-child').addEventListener('click', (e) => {
    e.stopPropagation();
    promptModal(getText('addSubmenu'), 'Nama submenu', '', (title) => {
      if (!title) return;
      const newNode = { id: uid(), title, content: `# ${title}\n\nTulis kandungan di sini…`, children: [] };
      node.children.push(newNode);
      node._expanded = true;
      state.activeId = newNode.id;
      saveState();
      renderTree();
      renderContent();
    });
  });

  frag.querySelector('.act-rename').setAttribute('title', getText('rename'));
  frag.querySelector('.act-rename').addEventListener('click', (e) => {
    e.stopPropagation();
    promptModal(getText('rename'), 'Nama baharu', node.title, (title) => {
      if (!title) return;
      node.title = title;
      saveState();
      renderTree();
      renderContent();
    });
  });

  frag.querySelector('.act-up').setAttribute('title', getText('moveUp'));
  frag.querySelector('.act-up').addEventListener('click', (e) => {
    e.stopPropagation();
    moveNode(node.id, 'up');
  });

  frag.querySelector('.act-down').setAttribute('title', getText('moveDown'));
  frag.querySelector('.act-down').addEventListener('click', (e) => {
    e.stopPropagation();
    moveNode(node.id, 'down');
  });

  frag.querySelector('.act-duplicate').setAttribute('title', getText('duplicate'));
  frag.querySelector('.act-duplicate').addEventListener('click', (e) => {
    e.stopPropagation();
    const siblings = findParentArray(node.id);
    const index = siblings.findIndex(item => item.id === node.id);
    const copy = duplicateNode(node);
    siblings.splice(index + 1, 0, copy);
    state.activeId = copy.id;
    saveState();
    renderTree();
    renderContent();
  });

  frag.querySelector('.act-delete').setAttribute('title', getText('deleteNode'));
  frag.querySelector('.act-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    confirmModal(`${getText('deleteNode')} "${node.title}" dan semua submenunya?`, () => {
      const wasActive = (state.activeId === node.id) || !!findNode(state.activeId, node.children);
      removeNode(node.id);
      if (wasActive) {
        const all = flattenSearch();
        state.activeId = all.length ? all[0].id : null;
      }
      saveState();
      renderTree();
      renderContent();
    });
  });

  return item;
}

/* ---------- Rendering: main content ---------- */
function renderContent() {
  const node = state.activeId ? findNode(state.activeId) : null;

  if (!node) {
    contentEl.innerHTML = `
      <div class="empty-state">
        <div class="big-icon">📄</div>
        <h2>${getText('noPageSelected')}</h2>
        <p>${getText('noPageSelectedHint')}</p>
      </div>`;
    return;
  }

  const path = findPath(node.id) || [node];
  const allPages = flattenSearch();
  const currentIndex = allPages.findIndex(page => page.id === node.id);
  const previous = allPages[currentIndex - 1];
  const next = allPages[currentIndex + 1];

  const breadcrumbEl = document.getElementById('topbarBreadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = path.map((crumb, index) => `<span class="crumb-link" data-crumb-id="${crumb.id}">${escapeHtml(crumb.title)}</span>${index < path.length - 1 ? '<span class="crumb-sep">/</span>' : ''}`).join('');
  }

  contentEl.innerHTML = `
    <div class="page-header">
      <h1 class="page-title" id="pageTitle">${escapeHtml(node.title)}</h1>
      <div class="page-actions edit-only">
        <button class="btn btn-primary" id="btnEditContent">✎ ${getText('editContent')}</button>
      </div>
    </div>
    <div class="page-meta">${getText('lastUpdated')}</div>
    <div class="doc-layout">
      <div class="doc-main">
        <div class="markdown-body" id="pageBody"></div>
        <div class="prev-next-nav">
          ${previous ? `<a class="pn-link previous" data-page-id="${previous.id}"><span class="pn-label">← ${getText('prev')}</span><span class="pn-title">${escapeHtml(previous.title)}</span></a>` : ''}
          ${next ? `<a class="pn-link next" data-page-id="${next.id}"><span class="pn-label">${getText('next')} →</span><span class="pn-title">${escapeHtml(next.title)}</span></a>` : ''}
        </div>
      </div>
      <aside class="doc-toc" id="docToc"></aside>
    </div>
  `;

  const pageBody = document.getElementById('pageBody');
  pageBody.innerHTML = renderMarkdown(node.content || '');
  enhanceDocumentPage(pageBody);

  const titleEl = document.getElementById('pageTitle');
  document.getElementById('btnEditContent').addEventListener('click', () => renderEditor(node));

  // Inline title editing while in edit mode
  titleEl.addEventListener('blur', () => {
    if (!document.body.classList.contains('edit-mode')) return;
    const newTitle = titleEl.textContent.trim();
    if (newTitle && newTitle !== node.title) {
      node.title = newTitle;
      saveState();
      renderTree();
    }
  });

  applyEditModeToTitle(node);
}

function renderMarkdown(text) {
  const normalized = (text || '').replace(/(^|\n)(> \[!([A-Z]+)\][^\n]*(?:\n>.*)*)/gi, (match, prefix, block, label) => {
    const rawType = (label || '').trim().toLowerCase();
    const variant = {
      tip: 'tip',
      info: 'info',
      note: 'note',
      warning: 'warn',
      caution: 'warn',
      important: 'important',
      success: 'success',
      danger: 'danger',
      error: 'danger',
      quote: 'quote'
    }[rawType] || 'info';

    const iconMap = {
      tip: '💡',
      info: 'ℹ️',
      note: '📝',
      warn: '⚠️',
      important: '❗',
      success: '✅',
      danger: '⛔',
      quote: '❝'
    };

    const labelMap = {
      tip: 'Tip',
      info: 'Info',
      note: 'Note',
      warn: 'Warning',
      important: 'Important',
      success: 'Success',
      danger: 'Danger',
      quote: 'Quote'
    };

    const body = block
      .replace(/^>\s*\[![A-Z]+\][^\n]*\n?/i, '')
      .split('\n')
      .map(line => line.replace(/^>\s?/, ''))
      .join('\n')
      .trim();

    const html = marked.parse(body || 'Tulis nota di sini…');
    return `${prefix}<div class="callout callout-${variant}"><div class="callout-header"><span class="callout-icon">${iconMap[variant] || 'ℹ️'}</span><span>${labelMap[variant] || 'Info'}</span></div><div class="callout-body">${html}</div></div>`;
  });

  return marked.parse(normalized);
}

function enhanceDocumentPage(pageBody) {
  const toc = document.getElementById('docToc');
  const headings = [...pageBody.querySelectorAll('h2, h3')];
  if (headings.length) {
    toc.innerHTML = `<div class="doc-toc-title">${getText('pageInThisPage') || 'In this page'}</div>`;
    headings.forEach((heading, index) => {
      heading.id = `section-${index}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      link.className = heading.tagName === 'H3' ? 'toc-h3' : '';
      toc.appendChild(link);
    });
  } else {
    toc.remove();
  }

  initMediaGallery(pageBody);

  pageBody.querySelectorAll('pre').forEach((pre) => {
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.textContent = getText('copy');
    button.addEventListener('click', async () => {
      await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
      button.textContent = getText('copied');
      button.classList.add('copied');
      setTimeout(() => { button.textContent = getText('copy'); button.classList.remove('copied'); }, 1200);
    });
    pre.appendChild(button);
  });

  document.querySelectorAll('[data-page-id], [data-crumb-id]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = link.dataset.pageId || link.dataset.crumbId;
      if (!findNode(id)) return;
      state.activeId = id;
      saveState();
      renderTree();
      renderContent();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function applyEditModeToTitle(node) {
  const titleEl = document.getElementById('pageTitle');
  if (!titleEl) return;
  const editing = document.body.classList.contains('edit-mode');
  titleEl.contentEditable = editing ? 'true' : 'false';
}

function escapeAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMediaGalleryMarkup(items) {
  const isCollapsed = items.length > 4;
  const visibleItems = items.slice(0, 4);

  const galleryHtml = `
    <div class="media-gallery ${isCollapsed ? 'is-collapsed' : ''}" data-gallery-limit="4">
      ${items.map(item => {
        const src = escapeAttribute(item.src);
        const label = escapeAttribute(item.title || 'Media');

        if (item.type === 'video') {
          return `
            <a href='${src}' class='media-item' data-media-type='video'>
              <video controls preload='metadata' src='${src}'></video>
              <span class='media-badge'>Video</span>
            </a>
          `.replace(/\n\s+/g, ' ');
        }

        return `
          <a href='${src}' class='media-item' data-media-type='image'>
            <img src='${src}' alt='${label}' />
          </a>
        `.replace(/\n\s+/g, ' ');
      }).join('')}
    </div>
    ${isCollapsed ? `<button class="media-gallery-toggle" type="button">${getText('seeMore')}</button>` : ''}
  `;

  return galleryHtml.trim();
}

function initMediaGallery(pageBody) {
  const galleries = pageBody.querySelectorAll('.media-gallery');
  const galleryFn = window.lightGallery || window.Lightgallery;
  if (!galleryFn || !galleries.length) return;

  galleries.forEach((gallery) => {
    if (gallery.dataset.lgInitialized === 'true') return;
    gallery.dataset.lgInitialized = 'true';
    try {
      galleryFn(gallery, {
        selector: 'a',
        download: false,
        thumbnail: true,
        zoom: true,
        fullScreen: true,
        autoplayVideoOnSlide: true,
        hideControlOnEnd: false,
        loop: false,
        closable: true
      });
    } catch (error) {
      console.warn('Unable to initialize LightGallery', error);
    }
  });

  const toggles = pageBody.querySelectorAll('.media-gallery-toggle');
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const gallery = toggle.previousElementSibling;
      if (!gallery) return;
      const expanded = gallery.classList.toggle('is-expanded');
      const hiddenItems = gallery.querySelectorAll('.media-item:nth-child(n + 5)');
      hiddenItems.forEach((item) => {
        item.style.display = expanded ? 'block' : 'none';
      });
      toggle.textContent = expanded ? getText('seeLess') : getText('seeMore');
    });
  });
}

async function handleMediaUpload(files, textarea) {
  if (!files || !files.length) return;
  const mediaItems = [];

  for (const file of files) {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;

    const src = URL.createObjectURL(file);

    mediaItems.push({
      type: file.type.startsWith('video/') ? 'video' : 'image',
      src,
      title: file.name,
      mimeType: file.type
    });
  }

  if (!mediaItems.length) return;

  const snippet = buildMediaGalleryMarkup(mediaItems).trim();
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const current = textarea.value;
  const nextValue = `${current.slice(0, start)}\n${snippet}\n${current.slice(end)}`;
  textarea.value = nextValue;
  textarea.focus();
  textarea.setSelectionRange(start + snippet.length + 2, start + snippet.length + 2);
}

function renderEditor(node) {
  contentEl.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">${escapeHtml(node.title)}</h1>
    </div>
    <div class="editor-wrap">
      <div class="editor-panel">
        <div class="editor-header">
          <div class="editor-header-copy">
            <span class="editor-kicker">Editor</span>
            <h2>${escapeHtml(node.title)}</h2>
          </div>
          <span class="editor-status-badge">${getText('markdownSupported')}</span>
        </div>

        <div class="editor-toolbar" role="toolbar" aria-label="Toolbar Markdown">
          <button class="tb-btn" data-prefix="# " title="${getText('title')}">H</button>
          <button class="tb-btn" data-prefix="**" data-suffix="**" title="${getText('bold')}"><strong>B</strong></button>
          <button class="tb-btn" data-prefix="*" data-suffix="*" title="${getText('italic')}"><em>I</em></button>
          <button class="tb-btn" data-prefix="- " title="${getText('list')}">☷</button>
          <button class="tb-btn" data-snippet="- [ ] Tugas\n- [ ] Tugas lain\n" title="${getText('checklist')}">☑</button>
          <button class="tb-btn" data-prefix="[" data-suffix="](url)" title="${getText('link')}">↗</button>
          <button class="tb-btn" data-prefix="~~~\n" data-suffix="\n~~~" title="${getText('code')}">&lt;/&gt;</button>
          <button class="tb-btn" data-snippet="| Tajuk | Nilai |\n| --- | --- |\n| Contoh | Data |\n" title="${getText('table')}">▦</button>
          <span class="tb-sep"></span>
          <button class="tb-btn" data-callout="tip" title="${getText('tip')}">💡</button>
          <button class="tb-btn" data-callout="info" title="${getText('info')}">ℹ️</button>
          <button class="tb-btn" data-callout="note" title="${getText('note')}">📝</button>
          <button class="tb-btn" data-callout="warn" title="${getText('warning')}">⚠️</button>
          <button class="tb-btn" data-callout="important" title="${getText('important')}">❗</button>
          <button class="tb-btn" data-callout="success" title="${getText('success')}">✅</button>
          <button class="tb-btn" data-callout="danger" title="${getText('danger')}">⛔</button>
          <button class="tb-btn" data-callout="quote" title="${getText('quote')}">❝</button>
          <span class="tb-sep"></span>
          <button class="tb-btn" id="btnUploadMedia" title="${getText('uploadMedia')}">📷</button>
          <button class="tb-btn" id="btnPreview" title="${getText('preview')}">◉</button>
        </div>

        <input type="file" id="mediaUploadInput" accept="image/*,video/*" multiple hidden>
        <div class="editor-body">
          <textarea class="editor-textarea" id="editorTextarea" spellcheck="false">${escapeHtml(node.content || '')}</textarea>
        </div>

        <div class="editor-actions">
          <span class="editor-status" id="editorStatus">${getText('markdownSupported')}</span>
          <div>
            <button class="btn btn-ghost" id="btnCancelEdit">${getText('cancel')}</button>
            <button class="btn btn-primary" id="btnSaveEdit">💾 ${getText('save')}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  const textarea = document.getElementById('editorTextarea');
  const mediaInput = document.getElementById('mediaUploadInput');
  document.getElementById('btnUploadMedia').addEventListener('click', () => mediaInput.click());
  mediaInput.addEventListener('change', async () => {
    await handleMediaUpload(mediaInput.files, textarea);
    mediaInput.value = '';
  });
  contentEl.querySelectorAll('.tb-btn').forEach(button => {
    button.addEventListener('click', () => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.slice(start, end) || 'teks';

      if (button.dataset.callout) {
        const variant = button.dataset.callout;
        const label = {
          tip: 'TIP',
          info: 'INFO',
          note: 'NOTE',
          warn: 'WARNING',
          important: 'IMPORTANT',
          success: 'SUCCESS',
          danger: 'DANGER',
          quote: 'QUOTE'
        }[variant] || 'INFO';
        const replacement = `> [!${label}]\n> ${selected}\n`;
        textarea.setRangeText(replacement, start, end, 'select');
        textarea.focus();
        return;
      }

      if (button.dataset.snippet) {
        const replacement = button.dataset.snippet;
        textarea.setRangeText(replacement, start, end, 'select');
        textarea.focus();
        return;
      }

      const replacement = `${button.dataset.prefix}${selected}${button.dataset.suffix || ''}`;
      textarea.setRangeText(replacement, start, end, 'select');
      textarea.focus();
    });
  });
  document.getElementById('btnPreview').addEventListener('click', () => {
    const preview = document.createElement('div');
    preview.className = 'markdown-body editor-preview';
    preview.innerHTML = renderMarkdown(textarea.value);
    textarea.replaceWith(preview);
    document.getElementById('btnPreview').textContent = '✎';
    document.getElementById('btnPreview').title = getText('backToEditor');
    document.getElementById('btnPreview').onclick = () => renderEditor(node);
  });
  document.getElementById('btnCancelEdit').addEventListener('click', renderContent);
  document.getElementById('btnSaveEdit').addEventListener('click', () => {
    node.content = textarea.value;
    saveState();
    renderContent();
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Modal (add/rename) ---------- */
function promptModal(title, placeholder, initial, onConfirm) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${escapeHtml(title)}</h3>
      <input type="text" id="modalInput" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(initial || '')}">
      <div class="modal-actions">
        <button class="btn btn-ghost" id="modalCancel">${getText('cancel')}</button>
        <button class="btn btn-primary" id="modalOk">${getText('ok')}</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const input = backdrop.querySelector('#modalInput');
  input.focus();
  input.select();

  const close = () => backdrop.remove();
  backdrop.querySelector('#modalCancel').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('#modalOk').addEventListener('click', () => {
    const val = input.value.trim();
    close();
    onConfirm(val);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') backdrop.querySelector('#modalOk').click();
    if (e.key === 'Escape') close();
  });
}

function confirmModal(message, onConfirm) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal">
      <h3>${getText('confirmAction')}</h3>
      <p style="color:var(--text-muted); font-size:14px; margin-top:-6px;">${escapeHtml(message)}</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="modalCancel">${getText('cancel')}</button>
        <button class="btn btn-danger" id="modalOk">${getText('delete')}</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector('#modalCancel').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('#modalOk').addEventListener('click', () => { close(); onConfirm(); });
}

function getLanguage() {
  return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ms';
}

function updateBrandName() {
  const title = normalizeBookTitle(state.bookTitle);
  const brandNameEl = document.querySelector('.brand-name');
  if (brandNameEl) brandNameEl.textContent = title;
  document.title = `${title} — Modern Documentation`;
  state.bookTitle = title;
}

function getText(key) {
  return translations[getLanguage()][key] || key;
}

function applyLanguage(lang) {
  const active = lang === 'en' ? 'en' : 'ms';
  document.documentElement.lang = active;
  localStorage.setItem(LANG_KEY, active);
  syncSettingsPanel();

  const searchInputEl = document.getElementById('searchInput');
  if (searchInputEl) searchInputEl.placeholder = getText('searchPlaceholder');

  const settingsBtn = document.getElementById('settingsButton');
  if (settingsBtn) settingsBtn.title = getText('settings');
  settingsBtn?.setAttribute('aria-label', getText('settings'));

  const addRootPageBtn = document.getElementById('addRootPage');
  if (addRootPageBtn) {
    const icon = addRootPageBtn.querySelector('svg');
    addRootPageBtn.innerHTML = `${icon ? icon.outerHTML : ''}${getText('addMenu')}`;
  }

  const editToggle = document.getElementById('editModeToggle');
  if (editToggle) {
    const label = editToggle.querySelector('span');
    if (label) label.textContent = getText('editMode');
  }

  if (document.body && document.body.dataset) {
    renderTree();
    renderContent();
  }
}

function syncSettingsPanel() {
  const panel = document.querySelector('.settings-panel');
  if (!panel) return;

  const activeLang = getLanguage();
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  panel.querySelectorAll('[name="langChoice"]').forEach((radio) => {
    radio.checked = radio.value === activeLang;
  });

  const editToggle = panel.querySelector('#settingsEditToggle');
  if (editToggle) editToggle.checked = document.body.classList.contains('edit-mode');

  panel.querySelectorAll('[name="themeChoice"]').forEach((radio) => {
    radio.checked = radio.value === theme;
  });
}

function openSettingsPanel() {
  const existing = document.querySelector('.settings-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'settings-backdrop';
  backdrop.innerHTML = `
    <div class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settingsDialogTitle">
      <aside class="settings-sidebar">
        <div class="settings-sidebar-heading">
          <span class="settings-sidebar-mark">⚙</span>
          <span>${getText('settings')}</span>
        </div>
        <nav class="settings-nav" aria-label="${getText('settings')}">
          <button type="button" class="settings-nav-item is-active" data-settings-tab="general" aria-selected="true" aria-controls="settings-general">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v13a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 18.5v-13zM7 7h10M7 11h10M7 15h6"/></svg>
            <span>${getText('general')}</span>
          </button>
          <button type="button" class="settings-nav-item" data-settings-tab="appearance" aria-selected="false" aria-controls="settings-appearance">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 100 18h1.2a2.3 2.3 0 000-4.6h-.9a2.3 2.3 0 01-2.3-2.3c0-1.27 1.03-2.3 2.3-2.3H15a6 6 0 006-6A9 9 0 0012 3zM7.5 10.2a1.3 1.3 0 110-2.6 1.3 1.3 0 010 2.6zm4.5-3a1.3 1.3 0 110-2.6 1.3 1.3 0 010 2.6zm4.3 3a1.3 1.3 0 110-2.6 1.3 1.3 0 010 2.6z"/></svg>
            <span>${getText('appearance')}</span>
          </button>
        </nav>
      </aside>

      <div class="settings-main">
        <div class="settings-header">
          <div>
            <p class="settings-eyebrow">${getText('settings')}</p>
            <h3 id="settingsDialogTitle">${getText('general')}</h3>
            <p class="settings-description" data-settings-description>${getText('generalDescription')}</p>
          </div>
          <button class="icon-btn settings-close-btn" id="closeSettingsBtn" aria-label="${getText('close')}">×</button>
        </div>

        <div class="settings-scroll">
          <section class="settings-pane is-active" id="settings-general" data-settings-pane="general" role="tabpanel">
            <div class="settings-section">
              <div class="settings-field-copy">
                <label>${getText('language')}</label>
                <p>${getText('languageDescription')}</p>
              </div>
              <div class="segmented">
                <label><input type="radio" name="langChoice" value="ms" ${getLanguage() === 'ms' ? 'checked' : ''}><span>BM</span></label>
                <label><input type="radio" name="langChoice" value="en" ${getLanguage() === 'en' ? 'checked' : ''}><span>EN</span></label>
              </div>
            </div>

            <div class="settings-section">
              <div class="settings-field-copy">
                <label for="recipeBookNameInput">${getText('bookTitle')}</label>
                <p>${getText('bookTitleDescription')}</p>
              </div>
              <input id="recipeBookNameInput" type="text" value="${escapeAttribute(state.bookTitle || DEFAULT_BOOK_TITLE)}" maxlength="40" placeholder="RecipeBook">
            </div>
          </section>

          <section class="settings-pane" id="settings-appearance" data-settings-pane="appearance" role="tabpanel" hidden>
            <div class="settings-section">
              <div class="settings-field-copy">
                <label>${getText('theme')}</label>
                <p>${getText('themeDescription')}</p>
              </div>
              <div class="segmented">
                <label><input type="radio" name="themeChoice" value="light" ${document.documentElement.classList.contains('dark') ? '' : 'checked'}><span>${getText('light')}</span></label>
                <label><input type="radio" name="themeChoice" value="dark" ${document.documentElement.classList.contains('dark') ? 'checked' : ''}><span>${getText('dark')}</span></label>
              </div>
            </div>

            <div class="settings-section">
              <div class="settings-field-copy">
                <label>${getText('editMode')}</label>
                <p>${getText('editModeDescription')}</p>
              </div>
              <label class="switch">
                <input type="checkbox" id="settingsEditToggle" ${document.body.classList.contains('edit-mode') ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });

  document.getElementById('closeSettingsBtn').addEventListener('click', close);

  const settingsTabDescriptionKeys = {
    general: 'generalDescription',
    appearance: 'appearanceDescription'
  };
  backdrop.querySelectorAll('[data-settings-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const section = tab.dataset.settingsTab;
      backdrop.querySelectorAll('[data-settings-tab]').forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      backdrop.querySelectorAll('[data-settings-pane]').forEach((pane) => {
        const isActive = pane.dataset.settingsPane === section;
        pane.classList.toggle('is-active', isActive);
        pane.hidden = !isActive;
      });
      const title = backdrop.querySelector('#settingsDialogTitle');
      const description = backdrop.querySelector('[data-settings-description]');
      if (title) title.textContent = getText(section);
      if (description) description.textContent = getText(settingsTabDescriptionKeys[section]);
    });
  });

  backdrop.querySelectorAll('[name="langChoice"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      applyLanguage(radio.value);
    });
  });

  backdrop.querySelector('#settingsEditToggle').addEventListener('change', (event) => {
    setEditMode(event.target.checked);
  });

  const recipeBookNameInput = backdrop.querySelector('#recipeBookNameInput');
  recipeBookNameInput.addEventListener('change', (event) => {
    const nextTitle = normalizeBookTitle(event.target.value);
    state.bookTitle = nextTitle;
    event.target.value = nextTitle;
    updateBrandName();
    saveState();
  });

  backdrop.querySelectorAll('[name="themeChoice"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      applyTheme(radio.value);
    });
  });
}

function initSettings() {
  const btn = document.getElementById('settingsButton');
  if (!btn) return;

  btn.addEventListener('click', openSettingsPanel);
}

/* ---------- Edit mode toggle ---------- */
function initEditMode() {
  const btn = document.getElementById('editModeToggle');
  const enabled = localStorage.getItem(EDIT_KEY) === 'true';
  setEditMode(enabled);

  if (!btn) return;

  btn.addEventListener('click', () => {
    setEditMode(!document.body.classList.contains('edit-mode'));
  });
}

function setEditMode(on) {
  document.body.classList.toggle('edit-mode', on);
  const editBtn = document.getElementById('editModeToggle');
  if (editBtn) editBtn.classList.toggle('active', on);
  const label = editBtn?.querySelector('span');
  if (label) label.textContent = getText('editMode');
  localStorage.setItem(EDIT_KEY, on ? 'true' : 'false');
  syncSettingsPanel();
  const node = state.activeId ? findNode(state.activeId) : null;
  if (node) applyEditModeToTitle(node);
}

/* ---------- Theme toggle ---------- */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);

  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  const sun = document.getElementById('iconSun');
  const moon = document.getElementById('iconMoon');
  if (sun) sun.style.display = theme === 'dark' ? 'none' : 'block';
  if (moon) moon.style.display = theme === 'dark' ? 'block' : 'none';
  localStorage.setItem(THEME_KEY, theme);
  syncSettingsPanel();
}

/* ---------- Sidebar toggle (mobile) ---------- */
function initSidebarToggle() {
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const mediaQuery = window.matchMedia('(max-width: 800px)');

  const syncOverlay = () => {
    const showOverlay = mediaQuery.matches && !document.body.classList.contains('sidebar-collapsed');
    overlay.classList.toggle('visible', showOverlay);
  };

  const collapsed = localStorage.getItem(SIDEBAR_KEY) === 'true';
  applySidebarState(collapsed);
  syncOverlay();

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const next = !document.body.classList.contains('sidebar-collapsed');
    applySidebarState(next);
    syncOverlay();
  });

  overlay.addEventListener('click', () => {
    applySidebarState(true);
    syncOverlay();
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const clickedInsideSidebar = sidebarEl.contains(target);
    const clickedToggle = toggle.contains(target);
    const clickedOverlay = overlay.contains(target);
    const clickedContent = contentEl.contains(target);
    const isMobile = mediaQuery.matches;
    const sidebarOpen = !document.body.classList.contains('sidebar-collapsed');

    if (!isMobile || !sidebarOpen) return;
    if (clickedInsideSidebar || clickedToggle || clickedOverlay) return;
    if (!clickedContent) return;

    applySidebarState(true);
    syncOverlay();
  });

  window.addEventListener('resize', () => {
    const isMobile = mediaQuery.matches;
    if (!isMobile) {
      sidebarEl.classList.remove('mobile-open');
      overlay.classList.remove('visible');
    }
    syncOverlay();
  });
}

function applySidebarState(collapsed) {
  const isMobile = window.innerWidth <= 800;
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  sidebarEl.classList.toggle('collapsed', collapsed);
  sidebarEl.setAttribute('aria-expanded', String(!collapsed));
  localStorage.setItem(SIDEBAR_KEY, String(collapsed));

  if (isMobile) {
    sidebarEl.classList.toggle('mobile-open', !collapsed);
  } else {
    sidebarEl.classList.remove('mobile-open');
  }
}

/* ---------- Add root page ---------- */
function initAddRoot() {
  document.getElementById('addRootPage').addEventListener('click', () => {
    promptModal('Tambah Menu', 'Nama menu', '', (title) => {
      if (!title) return;
      const newNode = { id: uid(), title, content: `# ${title}\n\nTulis kandungan di sini…`, children: [] };
      state.pages.push(newNode);
      state.activeId = newNode.id;
      saveState();
      renderTree();
      renderContent();
    });
  });
}

function initDataTransfer() {
  document.getElementById('btnExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state.pages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `docbook-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btnExportMarkdown').addEventListener('click', () => {
    const node = state.activeId ? findNode(state.activeId) : null;
    if (!node) return;
    const content = `# ${node.title}\n\n${node.content || ''}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${node.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  });

  const fileInput = document.getElementById('importFile');
  document.getElementById('btnImport').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('Format tidak sah');
        state.pages = imported;
        state.activeId = flattenSearch()[0]?.id || null;
        saveState();
        renderTree();
        renderContent();
      } catch (error) {
        alert('Fail import tidak sah. Sila pilih sandaran DocBook yang betul.');
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  });
}

/* ---------- Search ---------- */
function initSearch() {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { renderTree(); return; }
    const all = flattenSearch();
    const matchIds = new Set(all.filter(n => n.title.toLowerCase().includes(q)).map(n => n.id));
    // Expand ancestors of matches and filter render
    menuTreeEl.innerHTML = '';
    state.pages.forEach(node => {
      const el = renderFilteredNode(node, matchIds, q);
      if (el) menuTreeEl.appendChild(el);
    });
  });
}

function nodeOrDescendantMatches(node, matchIds) {
  if (matchIds.has(node.id)) return true;
  return node.children.some(c => nodeOrDescendantMatches(c, matchIds));
}

function renderFilteredNode(node, matchIds, q) {
  if (!nodeOrDescendantMatches(node, matchIds)) return null;
  node._expanded = true;
  return renderTreeNode(node);
}

/* ---------- Init ---------- */
async function init() {
  await loadState();
  updateBrandName();
  applyLanguage(getLanguage());
  initTheme();
  initEditMode();
  initSettings();
  initSidebarToggle();
  initAddRoot();
  initDataTransfer();
  initSearch();
  renderTree();
  renderContent();
}

document.addEventListener('DOMContentLoaded', init);
