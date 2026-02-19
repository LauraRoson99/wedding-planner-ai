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
import { prettyApiError } from "@/lib/errors";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost("/auth/register", { name: name || undefined, email, password });
      nav("/login");
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
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
            <CardDescription>
              Empieza tu planificación en menos de un minuto.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre (opcional)</label>
            <Input
              placeholder="Laura"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <div className="text-xs text-muted-foreground">
              Consejo: usa una frase corta fácil de recordar.
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>

          <div className="pt-2 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link className="text-foreground hover:underline" to="/login">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
