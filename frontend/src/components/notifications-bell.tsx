import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ListCheck, Euro, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/services/notificationService";
import type { NotificationItem } from "@/services/notificationService";
import { getWeddingId } from "@/lib/auth";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [overdue, setOverdue] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    const weddingId = getWeddingId();
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await getNotifications(weddingId);
      setItems(res.notifications);
      setOverdue(res.counts.overdue);
    } catch {
      /* keep the header usable if it fails */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Refresh periodically so reminders stay current while the app is open.
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const total = items.length;

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8" aria-label="Notificaciones">
          <Bell className="size-5" />
          {total > 0 && (
            <span
              className={[
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                overdue > 0 ? "bg-red-500" : "bg-primary",
              ].join(" ")}
            >
              {total > 9 ? "9+" : total}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Recordatorios</span>
          {overdue > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-red-600">
              <AlertTriangle className="size-3.5" /> {overdue} vencido{overdue > 1 ? "s" : ""}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && total === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : total === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No hay nada urgente. ¡Todo al día! 🎉
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  to={n.kind === "task" ? "/tasks" : "/budget"}
                  className="flex items-start gap-3 px-3 py-2 text-sm hover:bg-muted"
                >
                  <span className="mt-0.5 shrink-0 rounded-lg bg-muted p-1.5">
                    {n.kind === "task" ? <ListCheck className="size-4" /> : <Euro className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{n.title}</span>
                    <span className="flex items-center gap-2 text-xs">
                      <span className={n.overdue ? "font-medium text-red-600" : "text-muted-foreground"}>
                        {n.overdue ? "Venció" : "Vence"} {formatDate(n.dueDate)}
                      </span>
                      {n.amount != null && (
                        <span className="text-muted-foreground">· {formatCurrency(n.amount)}</span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
