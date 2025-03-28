import {Routes, Route, Navigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage'; // Используем DashboardPage
import RequireAdmin from './components/RequireAdmin';
import AdminPanelPage from './pages/AdminPage';
import AdminUserFilesPage from './pages/AdminUserFilesPage';

export default function AppRoutes() {
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route index element={<HomePage/>}/>
        <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard"/> : <LoginPage/>}/>
        <Route path="register" element={isAuthenticated ? <Navigate to="/dashboard"/> : <RegisterPage/>}/>
        <Route
          path="dashboard"
          element={isAuthenticated ? <DashboardPage/> : <Navigate to="/login"/>}
        />

        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPanelPage/>
            </RequireAdmin>
          }
        />
        <Route
          path="admin/files/:id"
          element={
            <RequireAdmin>
              <AdminUserFilesPage/>
            </RequireAdmin>
          }
        />
      </Route>
    </Routes>
  );
}

