import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { apiPost } from "@/lib/api";
import { prettyApiError } from "@/lib/errors";

export default function ResetPassword() {
  const { token = "" } = useParams();
  const nav = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => nav("/login", { replace: true }), 2500);
    } catch (err: any) {
      setError(prettyApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña nueva para tu cuenta.</CardDescription>
      </CardHeader>

      <CardContent>
        {done ? (
          <div className="space-y-4">
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Tu contraseña se ha actualizado. Te llevamos al inicio de sesión...
            </div>
            <Link className="text-sm text-foreground hover:underline" to="/login">
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Repite la contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Cambiar contraseña"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <Link className="text-foreground hover:underline" to="/login">
                Volver a iniciar sesión
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
