import { toast } from "sonner";
import { prettyApiError } from "@/lib/errors";

export { toast };

/** Shows a clean error toast from an API/network error. */
export function toastError(e: unknown): void {
  toast.error(prettyApiError(e));
}
