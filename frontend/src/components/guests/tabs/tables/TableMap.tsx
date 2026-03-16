import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Armchair, Eraser, Check, X } from "lucide-react";
import type { TableDto, TablePersonDto, UpdateTableDto } from "@/features/tables/types";

type Props = {
  tables: TableDto[];
  selectedGuest: TablePersonDto | null;
  loading?: boolean;
  disabled?: boolean;
  onAssignGuestToSeat: (tableId: string, seatNumber: number) => void;
  onRemoveGuestFromSeat: (tableId: string, seatNumber: number) => void;
  onEditTable: (tableId: string, payload: UpdateTableDto) => Promise<void> | void;
  onDeleteTable: (tableId: string) => Promise<void> | void;
  onClearTable: (tableId: string) => Promise<void> | void;
};

function getGuestInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getSeatGuest(table: TableDto, seatNumber: number) {
  return table.guests.find((guest) => guest.seatNumber === seatNumber) ?? null;
}

function getGuestTone(guest: TablePersonDto | null, isSelectedSeat = false) {
  if (!guest) {
    return isSelectedSeat
      ? "border-primary/50 bg-primary/10 text-primary"
      : "border-dashed border-muted-foreground/30 bg-muted/40 text-muted-foreground";
  }

  if (guest.ageGroup === "BABY" || guest.ageGroup === "CHILD") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (guest.role === "COMPANION") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

export function TableMap({
  tables,
  selectedGuest,
  loading = false,
  disabled = false,
  onAssignGuestToSeat,
  onRemoveGuestFromSeat,
  onEditTable,
  onDeleteTable,
  onClearTable,
}: Props) {
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSeats, setEditSeats] = useState(8);

  const startEditing = (table: TableDto) => {
    setEditingTableId(table.id);
    setEditName(table.name);
    setEditSeats(table.seats);
  };

  const cancelEditing = () => {
    setEditingTableId(null);
    setEditName("");
    setEditSeats(8);
  };

  const saveEditing = async (table: TableDto) => {
    const payload: UpdateTableDto = {};

    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== table.name) {
      payload.name = trimmedName;
    }

    if (editSeats !== table.seats) {
      payload.seats = editSeats;
    }

    if (Object.keys(payload).length === 0) {
      cancelEditing();
      return;
    }

    await onEditTable(table.id, payload);
    cancelEditing();
  };

  const tableCards = useMemo(() => {
    return tables.map((table) => {
      const occupiedCount = table.guests.filter((g) => g.seatNumber != null).length;
      const seats = Array.from({ length: table.seats }, (_, i) => i + 1);

      return (
        <div
          key={table.id}
          className="rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {editingTableId === table.id ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nombre de la mesa"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={editSeats}
                    onChange={(e) => setEditSeats(Number(e.target.value))}
                    placeholder="Número de sillas"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void saveEditing(table)} disabled={disabled}>
                      <Check className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing} disabled={disabled}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-lg font-semibold">{table.name}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(table)}
                      disabled={disabled}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-1">
                      Ocupación: {occupiedCount} / {table.seats}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-1">
                      Libres: {table.seats - occupiedCount}
                    </span>
                  </div>
                </>
              )}
            </div>

            {editingTableId !== table.id && (
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => void onClearTable(table.id)}
                  disabled={disabled || occupiedCount === 0}
                  title="Vaciar mesa"
                >
                  <Eraser className="h-4 w-4 text-amber-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => void onDeleteTable(table.id)}
                  disabled={disabled}
                  title="Borrar mesa"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {seats.map((seatNumber) => {
              const guest = getSeatGuest(table, seatNumber);
              const isEmpty = !guest;
              const seatTone = getGuestTone(guest, Boolean(selectedGuest) && isEmpty);

              return (
                <button
                  key={seatNumber}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (guest) {
                      void onRemoveGuestFromSeat(table.id, seatNumber);
                    } else if (selectedGuest) {
                      void onAssignGuestToSeat(table.id, seatNumber);
                    }
                  }}
                  className={`group flex min-h-[112px] flex-col items-center justify-center rounded-2xl border p-3 text-center transition ${seatTone} ${
                    disabled ? "cursor-not-allowed opacity-70" : "hover:scale-[1.01]"
                  }`}
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-xs font-semibold shadow-sm">
                    {guest ? getGuestInitials(guest.name) : <Armchair className="h-4 w-4" />}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium">Silla {seatNumber}</p>

                    {guest ? (
                      <>
                        <p className="line-clamp-2 text-sm font-semibold">{guest.name}</p>
                        <p className="text-[11px] opacity-80">
                          {guest.ageGroup === "BABY"
                            ? "Bebé"
                            : guest.ageGroup === "CHILD"
                            ? "Niño"
                            : guest.role === "COMPANION"
                            ? "Acompañante"
                            : "Principal"}
                        </p>
                      </>
                    ) : selectedGuest ? (
                      <p className="text-[11px] opacity-80">Haz clic para sentar</p>
                    ) : (
                      <p className="text-[11px] opacity-80">Vacía</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    });
  }, [
    tables,
    selectedGuest,
    disabled,
    editingTableId,
    editName,
    editSeats,
    onAssignGuestToSeat,
    onRemoveGuestFromSeat,
    onEditTable,
    onDeleteTable,
    onClearTable,
  ]);

  return (
    <section className="min-w-0 flex-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Distribución de mesas</h3>
        <p className="text-sm text-muted-foreground">
          {selectedGuest
            ? `Persona seleccionada: ${selectedGuest.name}. Haz clic en una silla vacía para asignarla.`
            : "Selecciona una persona en la izquierda o haz clic en una silla ocupada para liberarla."}
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed bg-white p-6 text-sm text-muted-foreground">
          Cargando mesas...
        </div>
      ) : tables.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-6 text-sm text-muted-foreground">
          No hay mesas todavía. Crea la primera desde la parte superior.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">{tableCards}</div>
      )}
    </section>
  );
}