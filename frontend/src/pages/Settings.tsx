import { useEffect, useState } from "react";
import { Heart, Save, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiPost } from "@/lib/api";
import { getWedding, updateWedding } from "@/services/weddingService";
import {
  getWeddingId,
  setWeddingName,
  setWeddingDate,
  WEDDING_UPDATED_EVENT,
} from "@/lib/auth";
import { prettyApiError } from "@/lib/errors";

/** Converts an ISO datetime to the "YYYY-MM-DD" value an <input type="date"> expects. */
function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Settings() {
  const weddingId = getWeddingId() ?? "";

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (newPassword.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Las contraseñas no coinciden.");
      return;
    }

    setPwSaving(true);
    try {
      await apiPost("/auth/change-password", { currentPassword, newPassword });
      setPwSuccess("Contraseña actualizada.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(prettyApiError(err));
    } finally {
      setPwSaving(false);
    }
  }

  useEffect(() => {
    if (!weddingId) {
      setError("No se ha encontrado ninguna boda.");
      setIsLoading(false);
      return;
    }

    getWedding(weddingId)
      .then((wedding) => {
        setName(wedding.name);
        setDate(toDateInputValue(wedding.date));
      })
      .catch((err) => setError(prettyApiError(err)))
      .finally(() => setIsLoading(false));
  }, [weddingId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("El nombre de la boda no puede estar vacío.");
      return;
    }

    setIsSaving(true);
    try {
      // Store the date at midday to avoid timezone day-shifts in the countdown.
      const isoDate = date ? `${date}T12:00:00` : null;
      const updated = await updateWedding(weddingId, {
        name: name.trim(),
        date: isoDate,
      });

      setName(updated.name);
      setDate(toDateInputValue(updated.date));

      // Keep the cached wedding data in sync and notify the header countdown.
      setWeddingName(updated.name);
      setWeddingDate(updated.date);
      window.dispatchEvent(new Event(WEDDING_UPDATED_EVENT));

      setSuccess("Cambios guardados.");
    } catch (err) {
      setError(prettyApiError(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <div className="mb-6 space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium text-muted-foreground">
          <Heart className="size-4 text-rose-500" /> Ajustes de la boda
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Tu boda</h1>
        <p className="text-muted-foreground">
          Configura el nombre y la fecha de tu boda. La fecha alimenta la cuenta atrás de la cabecera.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
          <CardDescription>Edita la información principal de tu boda.</CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="wedding-name">Nombre de la boda</Label>
              <Input
                id="wedding-name"
                placeholder="Mi boda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wedding-date">Fecha de la boda</Label>
              <Input
                id="wedding-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isLoading || isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Déjala vacía si todavía no tienes fecha.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <Button type="submit" disabled={isLoading || isSaving} className="gap-2">
              <Save className="size-4" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" /> Cambiar contraseña
          </CardTitle>
          <CardDescription>Actualiza la contraseña de tu cuenta.</CardDescription>
        </CardHeader>

        <form onSubmit={onChangePassword}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña actual</Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={pwSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={pwSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Repite la nueva contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={pwSaving}
              />
            </div>

            {pwError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {pwSuccess}
              </div>
            )}

            <Button
              type="submit"
              disabled={pwSaving || !currentPassword || !newPassword}
              className="gap-2"
            >
              <KeyRound className="size-4" />
              {pwSaving ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
