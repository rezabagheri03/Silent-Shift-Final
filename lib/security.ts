export function safeAdminRedirect(value: string | null | undefined) {
  if (!value) return "/admin";
  return value === "/admin" || value.startsWith("/admin/") ? value : "/admin";
}
