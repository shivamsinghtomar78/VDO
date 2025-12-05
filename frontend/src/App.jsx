import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HeroPage from './pages/HeroPage'
import ResultPage from './pages/ResultPage'
import AnswerPage from './pages/AnswerPage'
import { ToastContainer } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import { LoadingProvider } from './utils/loadingContext.jsx'

export default function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HeroPage />} />
            <Route path="/result" element={<Navigate to="/results" />} />
            <Route path="/results" element={<ResultPage />} />
            <Route path="/answers" element={<AnswerPage />} />
          </Routes>
        </Router>
        <ToastContainer />
      </LoadingProvider>
    </ErrorBoundary>
  )
}
