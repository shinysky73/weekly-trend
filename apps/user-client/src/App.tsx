import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage, setupInterceptors } from './features/auth';
import { CategoryPage } from './features/category';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoryPage />} />
      </Route>
    </Routes>
  );
}

setupInterceptors();

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
