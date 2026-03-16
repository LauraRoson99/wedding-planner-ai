import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateTableDto } from "@/features/tables/types";

type Props = {
  onCreateTable: (payload: CreateTableDto) => Promise<void> | void;
  disabled?: boolean;
};

export function TableControls({ onCreateTable, disabled = false }: Props) {
  const [name, setName] = useState("");
  const [seats, setSeats] = useState(8);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (!Number.isFinite(seats) || seats < 1) return;

    await onCreateTable({
      name: trimmedName,
      seats,
    });

    setName("");
    setSeats(8);
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Crear mesa</h3>
        <p className="text-sm text-muted-foreground">
          Añade mesas una a una y define cuántas sillas tendrá cada una.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mesa novios, Mesa 1, Mesa infantil..."
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSubmit();
              }
            }}
          />
        </div>

        <div className="w-full md:w-40">
          <label className="mb-1 block text-sm font-medium">Sillas</label>
          <Input
            type="number"
            min={1}
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSubmit();
              }
            }}
          />
        </div>

        <Button onClick={() => void handleSubmit()} disabled={disabled || !name.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir mesa
        </Button>
      </div>
    </div>
  );
}