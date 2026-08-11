import { useEffect, useState } from "react";
import { Sparkles, Check, Euro, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  suggestBudget,
  createBudgetItemsBulk,
  createProvidersBulk,
} from "@/services/aiService";
import type { SuggestedBudgetItem, SuggestedProvider } from "@/services/aiService";
import { PROVIDER_CATEGORY_LABELS } from "@/services/providerService";
import type { ProviderCategory } from "@/services/providerService";
import { prettyApiError } from "@/lib/errors";
import { toast } from "@/lib/toast";

const BUDGET_CATEGORY_LABELS: Record<string, string> = {
  VENUE: "Finca / espacio",
  CATERING: "Banquete",
  DRESS: "Vestido",
  SUIT: "Traje",
  PHOTO_VIDEO: "Foto y vídeo",
  MUSIC: "Música",
  DECORATION: "Decoración",
  FLOWERS: "Flores",
  TRANSPORT: "Transporte",
  INVITATIONS: "Invitaciones",
  HONEYMOON: "Luna de miel",
  BEAUTY: "Belleza",
  CEREMONY: "Ceremonia",
  GIFTS: "Regalos",
  OTHER: "Otros",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

type ItemRow = SuggestedBudgetItem & { include: boolean };
type ProviderRow = SuggestedProvider & { include: boolean };

export default function AiBudgetSuggestions({
  weddingId,
  onCreated,
}: {
  weddingId: string;
  onCreated: () => void;
}) {
  const [configured, setConfigured] = useState(false);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    getAiStatus()
      .then((s) => setConfigured(s.configured))
      .catch(() => setConfigured(false));
  }, []);

  function openDialog() {
    setOpen(true);
    setError(null);
    setHasResult(false);
    setItems([]);
    setProviders([]);
  }

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await suggestBudget(weddingId, notes);
      setItems(res.budgetItems.map((i) => ({ ...i, include: true })));
      setProviders(res.providers.map((p) => ({ ...p, include: true })));
      setHasResult(true);
    } catch (e) {
      setError(prettyApiError(e));
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    const selItems = items.filter((i) => i.include);
    const selProviders = providers.filter((p) => p.include);
    if (!selItems.length && !selProviders.length) return;

    setCreating(true);
    setError(null);
    try {
      if (selItems.length) {
        await createBudgetItemsBulk(
          weddingId,
          selItems.map((i) => ({ name: i.name, category: i.category, estimatedAmount: i.estimatedAmount, notes: i.notes }))
        );
      }
      if (selProviders.length) {
        await createProvidersBulk(
          weddingId,
          selProviders.map((p) => ({ name: p.name, category: p.category, notes: p.notes }))
        );
      }
      setOpen(false);
      toast.success(`${selItems.length + selProviders.length} elemento${selItems.length + selProviders.length === 1 ? "" : "s"} añadido${selItems.length + selProviders.length === 1 ? "" : "s"}`);
      onCreated();
    } catch (e) {
      setError(prettyApiError(e));
    } finally {
      setCreating(false);
    }
  }

  if (!configured) return null;

  const selectedItemsTotal = items.filter((i) => i.include).reduce((s, i) => s + i.estimatedAmount, 0);
  const selectedCount = items.filter((i) => i.include).length + providers.filter((p) => p.include).length;

  return (
    <>
      <Button variant="outline" onClick={openDialog} className="gap-2 rounded-xl">
        <Sparkles className="size-4" /> Generar con IA
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[88vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Presupuesto y proveedores con IA
            </DialogTitle>
            <DialogDescription>
              Genera un reparto de presupuesto y una lista de proveedores. Revisa y confirma; nada se guarda hasta entonces.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="ai-budget-notes">Estilo, zona o preferencias (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="ai-budget-notes"
                placeholder="Ej: boda rústica en Granada, 100 invitados"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
              />
              <Button onClick={generate} disabled={loading}>
                {loading ? "Generando..." : hasResult ? "Regenerar" : "Generar"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {hasResult && (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {/* Partidas de presupuesto */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Euro className="size-4" /> Partidas ({items.length})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seleccionado: {formatCurrency(selectedItemsTotal)}
                  </p>
                </div>
                <ul className="space-y-2">
                  {items.map((row, i) => (
                    <li key={`i-${i}`}>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.map((r, idx) => (idx === i ? { ...r, include: !r.include } : r)))}
                        className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${row.include ? "border-primary/40 bg-primary/5" : "opacity-60 hover:opacity-100"}`}
                      >
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${row.include ? "border-primary bg-primary text-white" : "border-muted-foreground/40"}`}>
                          {row.include && <Check className="size-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{row.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {BUDGET_CATEGORY_LABELS[row.category] ?? row.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold">{formatCurrency(row.estimatedAmount)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Proveedores */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                  <Handshake className="size-4" /> Proveedores ({providers.length})
                </p>
                <ul className="space-y-2">
                  {providers.map((row, i) => (
                    <li key={`p-${i}`}>
                      <button
                        type="button"
                        onClick={() => setProviders((prev) => prev.map((r, idx) => (idx === i ? { ...r, include: !r.include } : r)))}
                        className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${row.include ? "border-primary/40 bg-primary/5" : "opacity-60 hover:opacity-100"}`}
                      >
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${row.include ? "border-primary bg-primary text-white" : "border-muted-foreground/40"}`}>
                          {row.include && <Check className="size-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{row.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {PROVIDER_CATEGORY_LABELS[row.category as ProviderCategory] ?? row.category}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={confirm} disabled={creating || loading || !hasResult || selectedCount === 0}>
              {creating ? "Añadiendo..." : `Añadir ${selectedCount} elemento${selectedCount === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
