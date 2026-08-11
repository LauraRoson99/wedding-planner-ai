import { Outlet } from "react-router-dom";
import { AppFooter } from "./app-footer";

export function AppAuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <p className="font-script text-5xl leading-none text-primary">Planifica2</p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Tu boda, bajo control
            </p>
          </div>
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
