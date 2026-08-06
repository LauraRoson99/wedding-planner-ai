// middleware/error.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { Prisma } from '../generated/client/client';

/** Turns a Zod issue into a friendly Spanish message for the most common cases. */
function zodIssueToMessage(issue: ZodIssue): string {
  const field = String(issue.path[0] ?? '');
  const anyIssue = issue as unknown as { format?: string; validation?: string };

  if (anyIssue.format === 'email' || anyIssue.validation === 'email') {
    return 'Introduce un email válido.';
  }
  if (issue.code === 'too_small') {
    if (field.toLowerCase().includes('password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return field ? `El campo "${field}" es obligatorio.` : 'Faltan datos obligatorios.';
  }
  if (issue.code === 'invalid_type') {
    return field ? `El campo "${field}" es obligatorio o tiene un formato incorrecto.` : 'Datos no válidos.';
  }
  return issue.message || 'Datos no válidos.';
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Validation errors → 400 with a readable message (never a raw 500 + JSON dump).
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return res.status(400).json({
      error: first ? zodIssueToMessage(first) : 'Datos no válidos.',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
  }

  // Known database errors → mapped to sensible statuses.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un registro con esos datos.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'No se ha encontrado el recurso.' });
    }
    if (err.code === 'P2003') {
      return res.status(400).json({ error: 'La referencia indicada no es válida.' });
    }
    return res.status(400).json({ error: 'No se ha podido completar la operación.' });
  }

  // Service-thrown { status, message } objects, or unexpected errors.
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message =
    status >= 500
      ? 'Ha ocurrido un error en el servidor. Inténtalo de nuevo.'
      : err?.message || 'Ha ocurrido un error.';

  res.status(status).json({ error: message });
}
