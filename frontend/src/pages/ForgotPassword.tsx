import { useState } from "react";
import { Link } from "react-router-dom";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(prettyApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un enlace para elegir una nueva contraseña.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Si existe una cuenta con ese email, te hemos enviado un enlace para restablecer la contraseña. Revisa tu bandeja de entrada.
            </div>
            <Link className="text-sm text-foreground hover:underline" to="/login">
              ← Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
              {loading ? "Enviando..." : "Enviar enlace"}
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
