export type InvitationTemplateInput = {
  guestName: string;
  weddingName: string;
  weddingDate: Date | null;
  rsvpUrl?: string | null;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

function formatWeddingDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Escapes user-provided values before interpolating them into the HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderInvitationEmail(input: InvitationTemplateInput): RenderedEmail {
  const guestName = input.guestName.trim() || 'Invitado/a';
  const weddingName = input.weddingName.trim() || 'nuestra boda';
  const formattedDate = formatWeddingDate(input.weddingDate);

  const subject = `¡Estás invitado/a a ${weddingName}!`;

  const dateLine = formattedDate
    ? `Será el <strong>${escapeHtml(formattedDate)}</strong>.`
    : 'Muy pronto te confirmaremos la fecha.';

  const dateLineText = formattedDate
    ? `Será el ${formattedDate}.`
    : 'Muy pronto te confirmaremos la fecha.';

  const rsvpUrl = input.rsvpUrl?.trim() || null;

  const rsvpButtonHtml = rsvpUrl
    ? `<div style="margin:8px 0 24px;">
          <a href="${escapeHtml(rsvpUrl)}" style="display:inline-block;background:#be185d;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;">
            Confirmar asistencia
          </a>
        </div>`
    : '';

  const rsvpTextLine = rsvpUrl
    ? `\nConfirma tu asistencia aquí: ${rsvpUrl}\n`
    : '';

  const html = `
  <div style="margin:0;padding:0;background:#fdf2f8;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#3f3f46;">
      <div style="background:#ffffff;border-radius:20px;padding:36px 28px;box-shadow:0 4px 20px rgba(190,24,93,0.08);text-align:center;">
        <div style="font-size:40px;line-height:1;margin-bottom:12px;">💍</div>
        <h1 style="margin:0 0 8px;font-size:24px;color:#be185d;">${escapeHtml(weddingName)}</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#a1a1aa;letter-spacing:0.08em;text-transform:uppercase;">Invitación de boda</p>
        <p style="margin:0 0 16px;font-size:16px;">Hola <strong>${escapeHtml(guestName)}</strong>,</p>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
          Nos hace mucha ilusión invitarte a celebrar nuestro gran día con nosotros. ${dateLine}
        </p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
          Te iremos compartiendo todos los detalles. ¡Esperamos verte allí! 💖
        </p>
        ${rsvpButtonHtml}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #f4f4f5;font-size:13px;color:#a1a1aa;">
          Enviado con cariño desde Planifica2
        </div>
      </div>
    </div>
  </div>`.trim();

  const text = [
    `Hola ${guestName},`,
    '',
    `Nos hace mucha ilusión invitarte a ${weddingName}. ${dateLineText}`,
    '',
    'Te iremos compartiendo todos los detalles. ¡Esperamos verte allí!',
    rsvpTextLine,
    'Enviado con cariño desde Planifica2',
  ].join('\n');

  return { subject, html, text };
}
