import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { LoginPage, setupInterceptors } from './features/auth';
import { CategoryPage } from './features/category';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { RunDetailPage } from './features/newsletter';

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/runs/:id" element={<RunDetailPage />} />
        <Route path="/categories" element={<CategoryPage />} />
      </Route>
    </Routes>
  );
}

setupInterceptors();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
