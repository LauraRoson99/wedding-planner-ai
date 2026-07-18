import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, X, CalendarDays, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getPublicRsvp, submitPublicRsvp, DIET_LABELS,
} from "@/services/rsvpService";
import type {
  PublicRsvp, RsvpStatus, Diet, PublicRsvpCompanion,
} from "@/services/rsvpService";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function PublicRsvp() {
  const { token = "" } = useParams();

  const [data, setData] = useState<PublicRsvp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [attending, setAttending] = useState<boolean | null>(null);
  const [diet, setDiet] = useState<Diet>("NONE");
  const [dietNotes, setDietNotes] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [companions, setCompanions] = useState<PublicRsvpCompanion[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setLoadError("Enlace inválido."); setIsLoading(false); return; }
    getPublicRsvp(token)
      .then((res) => {
        setData(res);
        setAttending(res.guest.rsvp === "PENDING" ? null : res.guest.rsvp === "CONFIRMED");
        setDiet(res.guest.diet);
        setDietNotes(res.guest.dietNotes ?? "");
        setAllergiesText((res.guest.allergies ?? []).join(", "));
        setCompanions(res.companions);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Error"))
      .finally(() => setIsLoading(false));
  }, [token]);

  function setCompanionAttending(id: string, coming: boolean) {
    setCompanions((prev) => prev.map((c) =>
      c.id === id ? { ...c, rsvp: coming ? "CONFIRMED" : "DECLINED" } : c
    ));
  }

  async function onSubmit() {
    if (attending === null) { setSubmitError("Indica si podrás asistir."); return; }
    setSubmitError(null);
    setIsSaving(true);
    try {
      const rsvp: RsvpStatus = attending ? "CONFIRMED" : "DECLINED";
      const allergies = allergiesText
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      await submitPublicRsvp(token, {
        rsvp,
        diet,
        dietNotes: dietNotes.trim() || null,
        allergies,
        // If the main guest can't attend, mark companions as declined too.
        companions: companions.map((c) => ({
          id: c.id,
          rsvp: attending ? c.rsvp : "DECLINED",
        })),
      });
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-background to-pink-50 px-4 py-10 dark:from-rose-950/20 dark:via-background dark:to-pink-950/20">
      <div className="mx-auto w-full max-w-lg">
        {isLoading ? (
          <div className="rounded-2xl border bg-background p-8 text-center text-muted-foreground shadow-sm">
            Cargando invitación...
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <div className="mb-2 text-4xl">😕</div>
            <h1 className="text-lg font-semibold">No hemos encontrado tu invitación</h1>
            <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          </div>
        ) : done ? (
          <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
            <div className="mb-3 text-5xl">💖</div>
            <h1 className="text-xl font-bold">¡Gracias, {data?.guest.name}!</h1>
            <p className="mt-2 text-muted-foreground">
              {attending
                ? "Hemos registrado tu confirmación. ¡Nos vemos en la boda!"
                : "Sentimos que no puedas venir. Hemos registrado tu respuesta."}
            </p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Cabecera */}
            <div className="rounded-2xl border bg-background p-6 text-center shadow-sm">
              <div className="mb-2 text-4xl">💍</div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Invitación de boda</p>
              <h1 className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-300">{data.wedding.name}</h1>
              {formatDate(data.wedding.date) && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" /> {formatDate(data.wedding.date)}
                </p>
              )}
            </div>

            {/* Formulario */}
            <div className="space-y-5 rounded-2xl border bg-background p-6 shadow-sm">
              <div>
                <p className="text-base font-medium">Hola {data.guest.name},</p>
                <p className="text-sm text-muted-foreground">¿Podrás acompañarnos en nuestro gran día?</p>
              </div>

              {/* Asistencia */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                    attending === true
                      ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20"
                      : "hover:bg-muted",
                  ].join(" ")}
                >
                  <Check className="size-4" /> Sí, asistiré
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={[
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                    attending === false
                      ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20"
                      : "hover:bg-muted",
                  ].join(" ")}
                >
                  <X className="size-4" /> No podré ir
                </button>
              </div>

              {attending && (
                <>
                  {/* Dieta */}
                  <div className="space-y-2">
                    <Label>Preferencia alimentaria</Label>
                    <Select value={diet} onValueChange={(v) => setDiet(v as Diet)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(DIET_LABELS) as Diet[]).map((d) => (
                          <SelectItem key={d} value={d}>{DIET_LABELS[d]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Alergias */}
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Alergias o intolerancias</Label>
                    <Input
                      id="allergies"
                      placeholder="Ej: gluten, frutos secos (separadas por comas)"
                      value={allergiesText}
                      onChange={(e) => setAllergiesText(e.target.value)}
                    />
                  </div>

                  {/* Notas dieta */}
                  <div className="space-y-2">
                    <Label htmlFor="dietNotes">Otras notas (opcional)</Label>
                    <Textarea
                      id="dietNotes"
                      placeholder="Cualquier cosa que debamos saber..."
                      value={dietNotes}
                      onChange={(e) => setDietNotes(e.target.value)}
                    />
                  </div>

                  {/* Acompañantes */}
                  {companions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Acompañantes</Label>
                      <p className="text-xs text-muted-foreground">Indica quién vendrá contigo.</p>
                      <ul className="space-y-2">
                        {companions.map((c) => (
                          <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2">
                            <span className="text-sm font-medium">{c.name}</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setCompanionAttending(c.id, true)}
                                className={[
                                  "rounded-lg border px-2.5 py-1 text-xs transition",
                                  c.rsvp === "CONFIRMED"
                                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20"
                                    : "hover:bg-muted",
                                ].join(" ")}
                              >
                                Viene
                              </button>
                              <button
                                type="button"
                                onClick={() => setCompanionAttending(c.id, false)}
                                className={[
                                  "rounded-lg border px-2.5 py-1 text-xs transition",
                                  c.rsvp === "DECLINED"
                                    ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20"
                                    : "hover:bg-muted",
                                ].join(" ")}
                              >
                                No viene
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {submitError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <Button onClick={onSubmit} disabled={isSaving} className="w-full gap-2">
                <Heart className="size-4" />
                {isSaving ? "Enviando..." : "Enviar confirmación"}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">Enviado con cariño desde Planifica2</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
