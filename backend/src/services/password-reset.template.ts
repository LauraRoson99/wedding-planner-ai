export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPasswordResetEmail(resetUrl: string): RenderedEmail {
  const safeUrl = escapeHtml(resetUrl);
  const subject = 'Restablece tu contraseña de Planifica2';

  const html = `
  <div style="margin:0;padding:0;background:#fdf2f8;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#3f3f46;">
      <div style="background:#ffffff;border-radius:20px;padding:36px 28px;box-shadow:0 4px 20px rgba(190,24,93,0.08);">
        <h1 style="margin:0 0 12px;font-size:20px;color:#be185d;">Restablecer contraseña</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
          Hemos recibido una solicitud para restablecer la contraseña de tu cuenta de Planifica2.
          Pulsa el botón para elegir una nueva contraseña.
        </p>
        <div style="margin:20px 0;">
          <a href="${safeUrl}" style="display:inline-block;background:#be185d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">
            Restablecer contraseña
          </a>
        </div>
        <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Este enlace caduca en 1 hora.</p>
        <p style="margin:0;font-size:13px;color:#71717a;">Si no has solicitado esto, puedes ignorar este correo; tu contraseña no cambiará.</p>
      </div>
    </div>
  </div>`.trim();

  const text = [
    'Restablecer contraseña de Planifica2',
    '',
    'Hemos recibido una solicitud para restablecer tu contraseña.',
    'Abre este enlace para elegir una nueva (caduca en 1 hora):',
    resetUrl,
    '',
    'Si no has solicitado esto, ignora este correo.',
  ].join('\n');

  return { subject, html, text };
}
