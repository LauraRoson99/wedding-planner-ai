import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, Users, Baby, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { TablePersonDto } from "@/features/tables/types";

type Props = {
  guests: TablePersonDto[];
  assignedGuestIds: Set<string>;
  selectedGuest: TablePersonDto | null;
  onSelect: (guest: TablePersonDto | null) => void;
  loading?: boolean;
};

function getGroupName(guest: TablePersonDto) {
  return guest.group?.name?.trim() || "Sin grupo";
}

function getGuestBadge(guest: TablePersonDto) {
  if (guest.ageGroup === "BABY") return "Bebé";
  if (guest.ageGroup === "CHILD") return "Niño";
  if (guest.role === "COMPANION") return "Acompañante";
  return "Principal";
}

function getGuestIcon(guest: TablePersonDto) {
  if (guest.ageGroup === "BABY" || guest.ageGroup === "CHILD") {
    return <Baby className="h-4 w-4" />;
  }

  if (guest.role === "COMPANION") {
    return <Users className="h-4 w-4" />;
  }

  return <User className="h-4 w-4" />;
}

export function GuestList({
  guests,
  assignedGuestIds,
  selectedGuest,
  onSelect,
  loading = false,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "UNASSIGNED" | "ADULTS" | "CHILDREN">("UNASSIGNED");
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesSearch =
        !query ||
        guest.name.toLowerCase().includes(query) ||
        getGroupName(guest).toLowerCase().includes(query);

      const isAssigned = assignedGuestIds.has(guest.id);
      const isChild = guest.ageGroup === "CHILD" || guest.ageGroup === "BABY";
      const isAdult = guest.ageGroup === "ADULT";

      const matchesFilter =
        filter === "ALL" ||
        (filter === "UNASSIGNED" && !isAssigned) ||
        (filter === "ADULTS" && isAdult) ||
        (filter === "CHILDREN" && isChild);

      return matchesSearch && matchesFilter;
    });
  }, [guests, assignedGuestIds, search, filter]);

  const groupedGuests = useMemo(() => {
    return filteredGuests.reduce<Record<string, TablePersonDto[]>>((acc, guest) => {
      const groupName = getGroupName(guest);
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(guest);
      return acc;
    }, {});
  }, [filteredGuests]);

  const groupEntries = useMemo(() => {
    return Object.entries(groupedGuests).sort(([a], [b]) => a.localeCompare(b, "es"));
  }, [groupedGuests]);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const ensureGroupIsOpen = (group: string) => {
    setOpenGroups((prev) => (prev.includes(group) ? prev : [...prev, group]));
  };

  const handleSelect = (guest: TablePersonDto) => {
    if (assignedGuestIds.has(guest.id)) return;

    const isAlreadySelected = selectedGuest?.id === guest.id;
    if (isAlreadySelected) {
      onSelect(null);
      return;
    }

    ensureGroupIsOpen(getGroupName(guest));
    onSelect(guest);
  };

  return (
    <aside className="w-full xl:w-80 shrink-0 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Invitados</h3>
          <p className="text-sm text-muted-foreground">
            Selecciona una persona y luego haz clic en una silla vacía.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar invitado o grupo"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("UNASSIGNED")}
            className={`rounded-full px-3 py-1 text-sm transition ${
              filter === "UNASSIGNED"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Sin asignar
          </button>

          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-full px-3 py-1 text-sm transition ${
              filter === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() => setFilter("ADULTS")}
            className={`rounded-full px-3 py-1 text-sm transition ${
              filter === "ADULTS"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Adultos
          </button>

          <button
            type="button"
            onClick={() => setFilter("CHILDREN")}
            className={`rounded-full px-3 py-1 text-sm transition ${
              filter === "CHILDREN"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Niños
          </button>
        </div>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Cargando invitados...
          </div>
        ) : groupEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No hay invitados que coincidan con el filtro.
          </div>
        ) : (
          groupEntries.map(([groupName, groupGuests]) => {
            const isOpen = openGroups.includes(groupName);

            return (
              <div key={groupName} className="rounded-xl border bg-background/40">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left"
                  onClick={() => toggleGroup(groupName)}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    {groupName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {groupGuests.length}
                  </span>
                </button>

                {isOpen && (
                  <ul className="space-y-2 px-3 pb-3">
                    {groupGuests.map((guest) => {
                      const isAssigned = assignedGuestIds.has(guest.id);
                      const isSelected = selectedGuest?.id === guest.id;

                      return (
                        <li key={guest.id}>
                          <button
                            type="button"
                            disabled={isAssigned}
                            onClick={() => handleSelect(guest)}
                            className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : isAssigned
                                ? "cursor-not-allowed border-dashed opacity-55"
                                : "hover:border-primary/40 hover:bg-muted/60"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {getGuestIcon(guest)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-medium">{guest.name}</p>
                                {guest.role === "COMPANION" && guest.parentId && (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                    +1 / hijo
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full bg-muted px-2 py-0.5">
                                  {getGuestBadge(guest)}
                                </span>

                                {isAssigned && guest.table?.name && guest.seatNumber ? (
                                  <span className="rounded-full bg-muted px-2 py-0.5">
                                    {guest.table.name} · Silla {guest.seatNumber}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-muted px-2 py-0.5">
                                    Sin asignar
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}