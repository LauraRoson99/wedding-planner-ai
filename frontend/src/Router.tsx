import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import NotMatch from './pages/NotMatch'
import Sample from './pages/Sample'
import ComingSoon from './pages/ComingSoon'
import Home from './pages/Home'
import Tasks from './pages/Tasks'
import Guests from './pages/Guests'
import Agenda from './pages/Agenda'
import Budget from './pages/Budget'

export default function Router() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="pages">
                    <Route path="sample" element={<Sample />} />
                    <Route path="feature" element={<ComingSoon />} />
                </Route>
                <Route path="*" element={<NotMatch />} />
            </Route>
        </Routes>
    )
}