import { useEffect, useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAiStatus,
  suggestTasks,
  createTasksBulk,
} from "@/services/aiService";
import type { SuggestedTask } from "@/services/aiService";
import { prettyApiError } from "@/lib/errors";

const CATEGORY_LABELS: Record<string, string> = {
  GUESTS: "Invitados",
  CEREMONY: "Ceremonia",
  BANQUET: "Banquete",
  DECORATION: "Decoración",
  PHOTO_VIDEO: "Foto y vídeo",
  MUSIC: "Música",
  TRAVEL: "Viaje",
  OUTFITS: "Vestuario",
  PAPERWORK: "Papeleo",
  BUDGET: "Presupuesto",
  OTHER: "Otros",
};

const PRIORITY_LABELS: Record<string, string> = { LOW: "Baja", MEDIUM: "Media", HIGH: "Alta" };
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "border-red-200 bg-red-50 text-red-700",
  MEDIUM: "border-yellow-200 bg-yellow-50 text-yellow-700",
  LOW: "border-green-200 bg-green-50 text-green-700",
};

type Row = SuggestedTask & { include: boolean };

export default function AiTaskSuggestions({
  weddingId,
  onCreated,
}: {
  weddingId: string;
  onCreated: () => void;
}) {
  const [configured, setConfigured] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    getAiStatus()
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  async function generate() {
    if (!weddingId) return;
    setOpen(true);
    setLoading(true);
    setError(null);
    setRows([]);
    try {
      const res = await suggestTasks(weddingId);
      setRows(res.tasks.map((t) => ({ ...t, include: true })));
    } catch (e) {
      setError(prettyApiError(e));
    } finally {
      setLoading(false);
    }
  }

  function toggle(index: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, include: !r.include } : r)));
  }

  async function confirm() {
    const selected = rows.filter((r) => r.include);
    if (!selected.length) return;
    setCreating(true);
    setError(null);
    try {
      await createTasksBulk(
        weddingId,
        selected.map((r) => ({
          title: r.title,
          category: r.category,
          priority: r.priority,
          dueDate: r.dueDate,
          notes: r.notes,
        }))
      );
      setOpen(false);
      onCreated();
    } catch (e) {
      setError(prettyApiError(e));
    } finally {
      setCreating(false);
    }
  }

  if (!configured) return null;

  const selectedCount = rows.filter((r) => r.include).length;

  return (
    <>
      <Button variant="outline" onClick={generate} className="gap-2">
        <Sparkles className="size-4" /> Generar con IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Tareas sugeridas por IA
            </DialogTitle>
            <DialogDescription>
              Revisa y desmarca las que no quieras. Nada se guarda hasta que confirmes.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Generando propuestas... esto puede tardar unos segundos.
            </div>
          ) : (
            <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
              {rows.map((row, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    className={[
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                      row.include ? "border-primary/40 bg-primary/5" : "opacity-60 hover:opacity-100",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                        row.include ? "border-primary bg-primary text-white" : "border-muted-foreground/40",
                      ].join(" ")}
                    >
                      {row.include && <Check className="size-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{row.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORY_LABELS[row.category] ?? row.category}
                        </Badge>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${PRIORITY_COLORS[row.priority]}`}>
                          {PRIORITY_LABELS[row.priority] ?? row.priority}
                        </span>
                        {row.dueDate && (
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(row.dueDate).toLocaleDateString("es-ES")}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={confirm} disabled={creating || loading || selectedCount === 0}>
              {creating ? "Creando..." : `Crear ${selectedCount} tarea${selectedCount === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
