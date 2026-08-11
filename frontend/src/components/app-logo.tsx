export function AppLogo() {
    return (
        <div>
            <img
                src="/logo.png"
                className="dark:hidden h-10 w-auto"
                alt="Logo claro"
            />
            <img
                src="/logo.png"
                className="hidden dark:block h-10 w-auto"
                alt="Logo oscuro"
            />
        </div>
    )
}