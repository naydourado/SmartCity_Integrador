export function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

export function formatBool(value) {
  return value ? "Ativo" : "Inativo";
}

export function titleCase(text = "") {
  if (!text) return "-";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
