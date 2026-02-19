export function prettyApiError(raw: unknown): string {
  const msg = typeof raw === "string" ? raw : (raw as any)?.message;

  // Si el error ya es algo legible
  if (msg && !msg.startsWith("{")) return msg;

  try {
    const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;
    const errStr = parsed?.error;

    // Caso: backend devuelve {"error":"[ ... ]"}
    if (typeof errStr === "string") {
      const issues = JSON.parse(errStr);
      if (Array.isArray(issues) && issues.length) {
        // Primera issue
        const issue = issues[0];
        const field = issue?.path?.[0];

        if (field === "password" && issue?.code === "too_small") {
          return "La contraseña debe tener al menos 6 caracteres.";
        }
        if (field === "email") {
          return "Introduce un email válido.";
        }
        return issue?.message ?? "Datos inválidos.";
      }
    }

    // Caso alternativo
    if (typeof parsed?.error === "string") return parsed.error;

    return "Ha ocurrido un error. Revisa los datos e inténtalo de nuevo.";
  } catch {
    return "Ha ocurrido un error. Revisa los datos e inténtalo de nuevo.";
  }
}
