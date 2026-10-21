export function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

export function documentTitle(value, brand) {
  const title = cleanText(value);
  return title === brand || title.endsWith(` | ${brand}`)
    ? title
    : `${title} | ${brand}`;
}
