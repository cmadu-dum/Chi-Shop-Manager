
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddEntryPage from './pages/AddEntryPage';
import ReportsPage from './pages/ReportsPage';
import ProductsPage from './pages/ProductsPage';
import SellPage from './pages/SellPage';

const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add" element={<AddEntryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/sell" element={<SellPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </DataProvider>
  );
};

export default App;
