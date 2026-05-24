export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchesSearchText(fields, query) {
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return true;
  }

  const haystack = fields.map(normalizeSearchText).join(" ");
  return tokens.every((token) => haystack.includes(token));
}

export function getSearchScore(fields, query) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const normalizedFields = fields.map(normalizeSearchText);
  const joinedFields = normalizedFields.join(" ");

  if (normalizedFields.some((field) => field === normalizedQuery)) {
    return 0;
  }

  if (normalizedFields.some((field) => field.startsWith(normalizedQuery))) {
    return 1;
  }

  if (joinedFields.includes(normalizedQuery)) {
    return 2;
  }

  return 3;
}
