import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotMatch() {
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="space-y-4">
                <h2 className="text-8xl mb-4">404</h2>
                <h1 className="text-3xl font-semibold">¡Vaya! Página no encontrada</h1>
                <p className="text-sm text-muted-foreground">Lo sentimos, la página que buscas no existe.</p>
                <Link to="/" className={buttonVariants()}>Volver al inicio</Link>
            </div>
        </div>
    )
}