import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from '@/components/ErrorBoundary'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/pages/HomePage'
import AnalyzerPage from '@/pages/AnalyzerPage'
import SimulatorPage from '@/pages/SimulatorPage'
import ComparePage from '@/pages/ComparePage'
import KnowledgeBasePage from '@/pages/KnowledgeBasePage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
