import { useEffect, useState } from "react";
import { ChevronsUpDown, Check, Plus, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listWeddings, createWedding } from "@/services/weddingService";
import type { Wedding } from "@/services/weddingService";
import {
  getWeddingId,
  getWeddingName,
  setWeddingId,
  setWeddingName,
  setWeddingDate,
  WEDDING_UPDATED_EVENT,
} from "@/lib/auth";
import { prettyApiError } from "@/lib/errors";

export function WeddingSwitcher() {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [activeId] = useState<string>(getWeddingId() ?? "");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listWeddings()
      .then(setWeddings)
      .catch(() => {
        /* keep the header usable even if the list fails */
      });
  }, []);

  const active = weddings.find((w) => w.id === activeId);

  function applyActive(wedding: Wedding) {
    setWeddingId(wedding.id);
    setWeddingName(wedding.name);
    setWeddingDate(wedding.date);
    window.dispatchEvent(new Event(WEDDING_UPDATED_EVENT));
    // Reload so every page refetches its data for the newly selected wedding.
    window.location.reload();
  }

  function switchTo(wedding: Wedding) {
    if (wedding.id !== activeId) applyActive(wedding);
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Ponle un nombre a la boda.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const wedding = await createWedding({
        name: newName.trim(),
        date: newDate ? `${newDate}T12:00:00` : null,
      });
      applyActive(wedding); // switches to the new wedding and reloads
    } catch (err) {
      setError(prettyApiError(err));
      setCreating(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 max-w-[220px]">
            <Heart className="size-4 shrink-0 text-rose-500" />
            <span className="truncate">{active?.name ?? getWeddingName() ?? "Mi boda"}</span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Tus bodas</DropdownMenuLabel>
          {weddings.map((wedding) => (
            <DropdownMenuItem
              key={wedding.id}
              onClick={() => switchTo(wedding)}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{wedding.name}</span>
              {wedding.id === activeId && <Check className="size-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setError(null);
              setNewName("");
              setNewDate("");
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" /> Crear boda
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Nueva boda</DialogTitle>
            <DialogDescription>Crea otra boda y cambia a ella al instante.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-wedding-name">Nombre</Label>
              <Input
                id="new-wedding-name"
                placeholder="Ej: Boda de Ana y Luis"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-wedding-date">Fecha (opcional)</Label>
              <Input
                id="new-wedding-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creando..." : "Crear y cambiar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
