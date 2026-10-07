/**
 * Prefix a public-folder path with the GitHub Pages base path.
 * `next/link` does this on its own. Raw image and icon URLs do not.
 */
export function publicPath(path) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
