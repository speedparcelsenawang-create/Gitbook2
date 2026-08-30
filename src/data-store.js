export const DEFAULT_BOOK_TITLE = 'RecipeBook';

export function normalizeBookTitle(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || DEFAULT_BOOK_TITLE;
}

export function seedData() {
  return [
    {
      id: uid(),
      title: 'Pengenalan',
      children: [],
      content: `# Selamat Datang 👋

Ini adalah **DocBook**, sistem dokumentasi moden bergaya GitBook.

- Klik **Edit Mode** di penjuru atas untuk mula menyunting
- Guna butang **+** pada sidebar untuk tambah menu / submenu
- Tulis kandungan dalam format **Markdown**

> Semua perubahan disimpan automatik pada pelayar anda (localStorage).`
    },
    {
      id: uid(),
      title: 'Panduan Bermula',
      children: [
        {
          id: uid(),
          title: 'Pasang',
          children: [],
          content: `## Pasang DocBook\n\nTiada pemasangan diperlukan — cuma buka \`index.html\` dalam pelayar.`
        },
        {
          id: uid(),
          title: 'Konfigurasi',
          children: [],
          content: `## Konfigurasi\n\nUbah suai struktur menu terus dari sidebar semasa **Edit Mode** aktif.`
        }
      ],
      content: `# Panduan Bermula\n\nBahagian ini mengandungi submenu untuk membantu anda bermula.`
    },
    {
      id: uid(),
      title: 'Rujukan API',
      children: [],
      content: `# Rujukan API\n\n\`\`\`js\nfunction hello() {\n  console.log("Hello DocBook!");\n}\n\`\`\``
    }
  ];
}

export function uid() {
  return 'p_' + Math.random().toString(36).slice(2, 10);
}

function normalizePageNodes(input, seenIds = new Set(), depth = 0, counter = { value: 0 }) {
  if (!Array.isArray(input) || depth > 20) return [];

  return input.flatMap((value) => {
    if (!value || typeof value !== 'object' || counter.value >= 1000) return [];
    counter.value += 1;

    let id = typeof value.id === 'string' ? value.id.trim().slice(0, 120) : '';
    if (!id || seenIds.has(id)) id = uid();
    seenIds.add(id);

    const node = {
      id,
      title: typeof value.title === 'string' && value.title.trim()
        ? value.title.trim().slice(0, 300)
        : 'Untitled',
      content: typeof value.content === 'string' ? value.content.slice(0, 2_000_000) : '',
      children: normalizePageNodes(value.children, seenIds, depth + 1, counter)
    };

    const timestamp = typeof value.updatedAt === 'number'
      ? value.updatedAt
      : Date.parse(value.updatedAt || '');
    if (Number.isFinite(timestamp)) node.updatedAt = timestamp;
    if (typeof value._expanded === 'boolean') node._expanded = value._expanded;
    return [node];
  });
}

export function normalizeDocumentState(raw = {}) {
  const normalizedPages = normalizePageNodes(raw.pages);
  const pages = normalizedPages.length > 0 ? normalizedPages : seedData();
  const pageIds = new Set();
  const collectIds = (nodes) => nodes.forEach((node) => {
    pageIds.add(node.id);
    collectIds(node.children);
  });
  collectIds(pages);

  const activeId = typeof raw.activeId === 'string' && pageIds.has(raw.activeId)
    ? raw.activeId
    : pages[0]?.id || null;
  const bookTitle = normalizeBookTitle(raw.bookTitle);

  return {
    pages,
    activeId,
    bookTitle
  };
}
