import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ListCheck, Euro, AlertTriangle, Check, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotificationsRead } from "@/services/notificationService";
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
  const [loading, setLoading] = useState(false);
  // Reminders read while the panel is open keep their "unread" mark until it is
  // closed, so the list does not change under the pointer.
  const [justRead, setJustRead] = useState<string[]>([]);
  const openRef = useRef(false);

  async function load() {
    const weddingId = getWeddingId();
    if (!weddingId) return;
    setLoading(true);
    try {
      const res = await getNotifications(weddingId);
      setItems(res.notifications);
    } catch {
      /* keep the header usable if it fails */
    } finally {
      setLoading(false);
    }
  }

  async function markRead(keys?: string[]) {
    const weddingId = getWeddingId();
    if (!weddingId) return;
    const marked = keys ?? items.filter((n) => !n.read).map((n) => n.id);
    if (marked.length === 0) return;

    // Optimistic: the badge clears right away, even if the panel stays open.
    setItems((prev) => prev.map((n) => (marked.includes(n.id) ? { ...n, read: true } : n)));
    if (openRef.current) setJustRead((prev) => [...prev, ...marked]);

    try {
      const res = await markNotificationsRead(weddingId, keys);
      setItems(res.notifications);
    } catch {
      /* the next refresh resyncs the read state */
    }
  }

  useEffect(() => {
    load();
    // Refresh periodically so reminders stay current while the app is open.
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  function handleOpenChange(open: boolean) {
    openRef.current = open;
    setJustRead([]);
    if (open) {
      load();
    } else {
      // Everything listed has been seen by now.
      markRead();
    }
  }

  const total = items.length;
  const unread = items.filter((n) => !n.read).length;
  const unreadOverdue = items.filter((n) => !n.read && n.overdue).length;
  const overdue = items.filter((n) => n.overdue).length;

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          aria-label={unread > 0 ? `Notificaciones (${unread} sin leer)` : "Notificaciones"}
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span
              className={[
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                unreadOverdue > 0 ? "bg-red-500" : "bg-primary",
              ].join(" ")}
            >
              {unread > 9 ? "9+" : unread}
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

        {unread > 0 && (
          <div className="px-2 pb-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full justify-start gap-2 text-xs text-muted-foreground"
              onClick={(e) => {
                e.preventDefault();
                markRead();
              }}
            >
              <CheckCheck className="size-3.5" /> Marcar todo como leído
            </Button>
          </div>
        )}
        <DropdownMenuSeparator />

        {loading && total === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : total === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No hay nada urgente. ¡Todo al día! 🎉
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {items.map((n) => {
              const showUnread = !n.read || justRead.includes(n.id);
              return (
                <li key={n.id} className="group relative">
                  <Link
                    to={n.kind === "task" ? "/tasks" : "/budget"}
                    className={[
                      "flex items-start gap-3 py-2 pl-3 pr-9 text-sm hover:bg-muted",
                      showUnread ? "" : "opacity-60",
                    ].join(" ")}
                  >
                    <span className="mt-0.5 shrink-0 rounded-lg bg-muted p-1.5">
                      {n.kind === "task" ? (
                        <ListCheck className="size-4" />
                      ) : (
                        <Euro className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate font-medium">{n.title}</span>
                        {showUnread && (
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-primary"
                            aria-label="Sin leer"
                          />
                        )}
                      </span>
                      <span className="flex items-center gap-2 text-xs">
                        <span
                          className={n.overdue ? "font-medium text-red-600" : "text-muted-foreground"}
                        >
                          {n.overdue ? "Venció" : "Vence"} {formatDate(n.dueDate)}
                        </span>
                        {n.amount != null && (
                          <span className="text-muted-foreground">· {formatCurrency(n.amount)}</span>
                        )}
                      </span>
                    </span>
                  </Link>
                  {!n.read && (
                    <button
                      type="button"
                      aria-label={`Marcar ${n.title} como leído`}
                      title="Marcar como leído"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markRead([n.id]);
                      }}
                    >
                      <Check className="size-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
