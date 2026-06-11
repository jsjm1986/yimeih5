import { Routes, Route } from 'react-router-dom';
import { UploadPage } from './pages/UploadPage.js';
import { WaitingPage } from './pages/WaitingPage.js';
import { ResultPage } from './pages/ResultPage.js';
import { HistoryPage } from './pages/HistoryPage.js';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/waiting/:id" element={<WaitingPage />} />
      <Route path="/result/:id" element={<ResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
}
