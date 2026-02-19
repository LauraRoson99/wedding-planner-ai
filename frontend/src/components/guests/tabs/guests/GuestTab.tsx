import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api";
import type { GuestDto } from "@/features/guests/types";

export default function GuestTab() {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<GuestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weddingId = localStorage.getItem("weddingId") ?? "";

  async function loadGuests() {
    if (!weddingId) {
      setError("Falta weddingId. Guárdalo en localStorage para cargar invitados.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<GuestDto[]>(`/guests?weddingId=${encodeURIComponent(weddingId)}`);
      setGuests(data);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando invitados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));
  }, [guests, search]);

  async function handleAddGuest() {
    if (!weddingId) {
      setError("Falta weddingId en localStorage.");
      return;
    }
    const name = window.prompt("Nombre del invitado:");
    if (!name?.trim()) return;

    try {
      await apiPost(`/guests?weddingId=${encodeURIComponent(weddingId)}`, { name: name.trim() });
      await loadGuests();
    } catch (e: any) {
      setError(e?.message ?? "Error creando invitado");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Lista de invitados</h3>
        <Button onClick={handleAddGuest}>Añadir invitado</Button>
      </div>

      <Input
        placeholder="Buscar invitado por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="text-sm text-muted-foreground">Cargando...</div>}

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <ul className="space-y-2">
        {filteredGuests.map((guest) => (
          <li key={guest.id} className="p-2 rounded border bg-background shadow-sm">
            <div className="font-medium">{guest.name}</div>
            <div className="text-sm text-muted-foreground">
              {guest.group?.name ?? "Sin grupo"}
            </div>
          </li>
        ))}

        {!loading && filteredGuests.length === 0 && (
          <li className="text-sm text-muted-foreground italic">Sin resultados.</li>
        )}
      </ul>
    </div>
  );
}
