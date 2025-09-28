
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { TransactionsProvider } from './context/TransactionsContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddEntryPage from './pages/AddEntryPage';
import ReportsPage from './pages/ReportsPage';

const App: React.FC = () => {
  return (
    <TransactionsProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add" element={<AddEntryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </TransactionsProvider>
  );
};

export default App;
