import { describe, it, expect } from 'vitest';
import { renderInvitationEmail } from './invitation.template';

describe('renderInvitationEmail', () => {
  it('includes the guest name and wedding name', () => {
    const { subject, html, text } = renderInvitationEmail({
      guestName: 'Ana',
      weddingName: 'Boda de Prueba',
      weddingDate: new Date('2027-06-12T12:00:00Z'),
    });
    expect(subject).toContain('Boda de Prueba');
    expect(html).toContain('Ana');
    expect(text).toContain('Boda de Prueba');
  });

  it('renders the RSVP button only when a url is provided', () => {
    const withUrl = renderInvitationEmail({
      guestName: 'Ana',
      weddingName: 'X',
      weddingDate: null,
      rsvpUrl: 'http://localhost:5173/rsvp/tok123',
    });
    expect(withUrl.html).toContain('http://localhost:5173/rsvp/tok123');
    expect(withUrl.html).toContain('Confirmar asistencia');

    const withoutUrl = renderInvitationEmail({ guestName: 'Ana', weddingName: 'X', weddingDate: null });
    expect(withoutUrl.html).not.toContain('Confirmar asistencia');
  });

  it('escapes HTML in user-provided values', () => {
    const { html } = renderInvitationEmail({
      guestName: '<script>alert(1)</script>',
      weddingName: 'X',
      weddingDate: null,
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
