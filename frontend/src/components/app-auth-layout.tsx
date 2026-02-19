import { Outlet } from "react-router-dom";
import { AppFooter } from "./app-footer";

export function AppAuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
