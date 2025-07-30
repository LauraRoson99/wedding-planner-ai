export function AppLogo() {
    return (
        <div>
            <img
                src="/logo.png"
                className="dark:hidden h-60"
                alt="Logo claro"
            />
            <img
                src="/logo.png"
                className="hidden dark:block h-60"
                alt="Logo oscuro"
            />
        </div>
    )
}