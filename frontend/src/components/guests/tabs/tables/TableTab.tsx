import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { TableControls } from "./TableControls";
import { TableMap } from "./TableMap";
import { GuestList } from "./GuestList";
import type {
  CreateTableDto,
  TableDto,
  TablePersonDto,
  UpdateTableDto,
} from "@/features/tables/types";

type Props = {
  weddingId: string;
};

export default function TableTab({ weddingId }: Props) {
  const [tables, setTables] = useState<TableDto[]>([]);
  const [people, setPeople] = useState<TablePersonDto[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<TablePersonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tablesData, peopleData] = await Promise.all([
        apiGet<TableDto[]>(`/tables?weddingId=${weddingId}`),
        apiGet<TablePersonDto[]>(`/tables/people?weddingId=${weddingId}`),
      ]);

      setTables(tablesData);
      setPeople(peopleData);

      setSelectedPerson((current) => {
        if (!current) return null;
        return peopleData.find((p) => p.id === current.id) ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las mesas");
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const assignedPersonIds = useMemo(() => {
    return new Set(
      people.filter((person) => person.tableId && person.seatNumber).map((person) => person.id)
    );
  }, [people]);

  const handleCreateTable = async (payload: CreateTableDto) => {
    setSaving(true);
    setError(null);

    try {
      await apiPost<TableDto>(`/tables?weddingId=${weddingId}`, payload);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la mesa");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTable = async (tableId: string, payload: UpdateTableDto) => {
    setSaving(true);
    setError(null);

    try {
      await apiPut<TableDto>(`/tables/${tableId}`, payload);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la mesa");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    setSaving(true);
    setError(null);

    try {
      await apiDelete(`/tables/${tableId}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar la mesa");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPersonToSeat = async (tableId: string, seatNumber: number) => {
    if (!selectedPerson) return;

    setSaving(true);
    setError(null);

    try {
      await apiPut(`/tables/${tableId}/seats/${seatNumber}/assign`, {
        guestId: selectedPerson.id,
      });

      setSelectedPerson(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo asignar la persona");
    } finally {
      setSaving(false);
    }
  };

  const handleClearSeat = async (tableId: string, seatNumber: number) => {
    setSaving(true);
    setError(null);

    try {
      await apiDelete(`/tables/${tableId}/seats/${seatNumber}`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo liberar la silla");
    } finally {
      setSaving(false);
    }
  };

  const handleClearTable = async (tableId: string) => {
    setSaving(true);
    setError(null);

    try {
      await apiDelete(`/tables/${tableId}/guests`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo vaciar la mesa");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TableControls onCreateTable={handleCreateTable} disabled={saving || loading} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6 xl:flex-row">
        <GuestList
          guests={people}
          assignedGuestIds={assignedPersonIds}
          selectedGuest={selectedPerson}
          onSelect={setSelectedPerson}
          loading={loading}
        />

        <TableMap
          tables={tables}
          selectedGuest={selectedPerson}
          loading={loading}
          disabled={saving}
          onAssignGuestToSeat={handleAssignPersonToSeat}
          onRemoveGuestFromSeat={handleClearSeat}
          onEditTable={handleUpdateTable}
          onDeleteTable={handleDeleteTable}
          onClearTable={handleClearTable}
        />
      </div>
    </div>
  );
}