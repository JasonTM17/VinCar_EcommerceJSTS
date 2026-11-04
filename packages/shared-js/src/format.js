/**
 * @param {bigint | number} vnd
 * @returns {string}
 */
export function formatVND(vnd) {
  const n = typeof vnd === "bigint" ? vnd : BigInt(vnd);
  return `${n.toLocaleString("vi-VN")} ₫`;
}

/**
 * @param {string} input
 * @returns {string}
 */
export function slugify(input) {
  const normalized = input.replace(/đ/g, "d").replace(/Đ/g, "D");
  return normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
