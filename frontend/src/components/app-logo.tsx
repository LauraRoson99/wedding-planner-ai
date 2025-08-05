export function AppLogo() {
    return (
        <div>
            <img
                src="/logo.png"
                className="dark:hidden h-17"
                alt="Logo claro"
            />
            <img
                src="/logo.png"
                className="hidden dark:block h-17"
                alt="Logo oscuro"
            />
        </div>
    )
}