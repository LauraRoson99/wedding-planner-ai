import { useEffect, useMemo, useState } from "react";
import { Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  suggestSeating,
  applySeating,
} from "@/services/aiService";
import type { SeatingAssignment } from "@/services/aiService";
import { prettyApiError } from "@/lib/errors";

export default function AiSeatingSuggestions({
  weddingId,
  onApplied,
}: {
  weddingId: string;
  onApplied: () => void;
}) {
  const [configured, setConfigured] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<SeatingAssignment[]>([]);
  const [stats, setStats] = useState<{ assigned: number; unassigned: number } | null>(null);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    getAiStatus()
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  async function generate() {
    setOpen(true);
    setLoading(true);
    setError(null);
    setHasResult(false);
    setAssignments([]);
    setStats(null);
    try {
      const res = await suggestSeating(weddingId);
      setAssignments(res.assignments);
      setStats({ assigned: res.stats.assigned, unassigned: res.stats.unassigned });
      setHasResult(true);
    } catch (e) {
      setError(prettyApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    if (!assignments.length) return;
    setApplying(true);
    setError(null);
    try {
      await applySeating(
        weddingId,
        assignments.map((a) => ({ guestId: a.guestId, tableId: a.tableId, seatNumber: a.seatNumber }))
      );
      setOpen(false);
      onApplied();
    } catch (e) {
      setError(prettyApiError(e));
    } finally {
      setApplying(false);
    }
  }

  // Group assignments by table for the review UI.
  const byTable = useMemo(() => {
    const map = new Map<string, { tableName: string; seats: SeatingAssignment[] }>();
    for (const a of assignments) {
      const entry = map.get(a.tableId) ?? { tableName: a.tableName, seats: [] };
      entry.seats.push(a);
      map.set(a.tableId, entry);
    }
    for (const entry of map.values()) entry.seats.sort((x, y) => x.seatNumber - y.seatNumber);
    return Array.from(map.values());
  }, [assignments]);

  if (!configured) return null;

  return (
    <>
      <Button variant="outline" onClick={generate} className="gap-2 rounded-xl">
        <Sparkles className="size-4" /> Distribuir con IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Distribución de mesas propuesta
            </DialogTitle>
            <DialogDescription>
              Al aplicar, se <strong>reemplaza</strong> la distribución actual. Nada cambia hasta que confirmes.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Generando distribución... esto puede tardar unos segundos.
            </div>
          ) : hasResult ? (
            <>
              {stats && (
                <p className="text-sm text-muted-foreground">
                  {stats.assigned} invitados asignados
                  {stats.unassigned > 0 && ` · ${stats.unassigned} sin sitio (faltan asientos)`}
                </p>
              )}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {byTable.map((t) => (
                  <div key={t.tableName} className="rounded-xl border p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                      <Users className="size-4" /> {t.tableName}
                      <span className="text-xs font-normal text-muted-foreground">({t.seats.length})</span>
                    </p>
                    <ul className="space-y-1">
                      {t.seats.map((s) => (
                        <li key={s.guestId} className="flex items-center gap-2 text-sm">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                            {s.seatNumber}
                          </span>
                          <span className="truncate">{s.guestName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={apply} disabled={applying || loading || !hasResult || assignments.length === 0}>
              {applying ? "Aplicando..." : "Aplicar distribución"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
