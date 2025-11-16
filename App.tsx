
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AddEntryPage from './pages/AddEntryPage';
import ReportsPage from './pages/ReportsPage';
import ProductsPage from './pages/ProductsPage';
import SellPage from './pages/SellPage';
import InventoryReportPage from './pages/InventoryReportPage';
import LowStockPage from './pages/LowStockPage';
import DemandForecastPage from './pages/DemandForecastPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/add" element={<AddEntryPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/sell" element={<SellPage />} />
                        <Route path="/inventory-report" element={<InventoryReportPage />} />
                        <Route path="/low-stock" element={<LowStockPage />} />
                        <Route path="/demand-forecast" element={<DemandForecastPage />} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
