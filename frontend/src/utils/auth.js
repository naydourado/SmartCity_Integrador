export function saveAuth(access, user) {
  localStorage.setItem("token", access);
  localStorage.setItem("usuario", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}

export function isAdmin(user = getUser()) {
  return Boolean(
    user?.is_staff ||
    user?.is_superuser ||
    user?.tipo === "admin"
  );
}