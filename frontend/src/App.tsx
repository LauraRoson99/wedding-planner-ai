import { BrowserRouter, HashRouter } from 'react-router'
import { ThemeProvider } from './context/ThemeContext'
import { AppToaster } from './components/app-toaster'
import Router from './Router'

const AppRouter = import.meta.env.VITE_USE_HASH_ROUTE === 'true' ? HashRouter : BrowserRouter

export default function App() {
    return (
        <ThemeProvider>
            <AppRouter>
                <Router />
            </AppRouter>
            <AppToaster />
        </ThemeProvider>
    )
}