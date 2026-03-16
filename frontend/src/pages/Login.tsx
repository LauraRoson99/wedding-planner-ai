import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { setAccessToken, setRefreshToken, setWeddingId } from "@/lib/auth";
import { prettyApiError } from "@/lib/errors";

type LoginResponse = {
  access: string;
  refresh: string;
  wedding?: {
    id: string;
    name: string;
    date?: string | null;
  } | null;
};

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("demo@planifica2.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiPost<LoginResponse>("/auth/login", { email, password });

      setAccessToken(res.access);
      setRefreshToken(res.refresh);

      if (res.wedding?.id) {
        setWeddingId(res.wedding.id);
      }

      nav("/guests");
    } catch (err: any) {
      setError(prettyApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-lg">💍</span>
          </div>
          <div>
            <CardTitle className="text-2xl">Bienvenido/a</CardTitle>
            <CardDescription>
              Entra y sigue diseñando tu boda con calma.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link className="text-foreground hover:underline" to="/register">
              Crear cuenta
            </Link>
          </div>

          <div className="mt-4 rounded-lg border bg-background/60 p-4">
            <div className="mb-2 text-sm font-medium">Con Planifica2 puedes:</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Organizar invitados y grupos sin líos</li>
              <li>• Diseñar mesas de forma visual</li>
              <li>• Planificar agenda y tareas clave</li>
            </ul>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}