import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LaporanList from './pages/LaporanList';
import LaporanForm from './pages/LaporanForm';
import LaporanDetail from './pages/LaporanDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
                S
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-800">SIMIKOT</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-slate-500 hidden sm:block">Portal Warga</span>
              <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                W
              </div>
            </div>
          </div>
        </nav>

        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Navigate to="/laporan" replace />} />
            <Route path="/laporan" element={<LaporanList />} />
            <Route path="/laporan/baru" element={<LaporanForm />} />
            <Route path="/laporan/:id" element={<LaporanDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
