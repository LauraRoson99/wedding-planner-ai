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
export declare function renderInvitationEmail(input: InvitationTemplateInput): RenderedEmail;
//# sourceMappingURL=invitation.template.d.ts.map