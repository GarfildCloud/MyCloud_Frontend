import {AppBar, Toolbar, Typography, Button, Container, Box} from '@mui/material';
import {Link, useNavigate, Outlet} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {logout as logoutAction} from '../store/authSlice';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {logout as logoutHelper} from '../services/auth';
import {useState} from 'react';

export default function Layout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = !!user;
  const fullName = user?.full_name;
  const isAdmin = user?.is_admin;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutHelper();
      // После успешного выхода перенаправляем на страницу входа
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Даже если произошла ошибка, все равно перенаправляем на страницу входа
      // и очищаем состояние в Redux
      dispatch(logoutAction());
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Левая часть шапки: заголовок и кнопка "Мои файлы" */}
          <Box sx={{display: 'flex', alignItems: 'center', flexGrow: 1}}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{textDecoration: 'none', color: 'inherit', mr: 2}}
            >
              My Cloud
            </Typography>

            {/* Кнопка "Мои файлы" слева от имени */}
            {isLoggedIn && (
              <Button color="inherit" component={Link} to="/dashboard">
                Мои файлы
              </Button>
            )}
            {isLoggedIn && isAdmin && (
              <Button color="inherit" component={Link} to="/admin" sx={{ml: 2}}>
                Админка
              </Button>
            )}
          </Box>


          {/* Отображаем имя пользователя, если он вошёл */}
          {isLoggedIn && fullName && (
            <Typography sx={{mr: 2}}>
              {fullName}
            </Typography>
          )}

          {/* Кнопки в зависимости от авторизации */}
          {isLoggedIn ? (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Выход...' : 'Выйти'}
            </Button>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Вход
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{mt: 4}}>
        <Outlet/>
      </Container>
    </>
  );
}