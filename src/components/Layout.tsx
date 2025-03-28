import {AppBar, Toolbar, Typography, Button, Container, Box} from '@mui/material';
import {Link, useNavigate, Outlet} from 'react-router-dom';
import {getAccessToken, logout} from '../services/auth';
import {useDispatch} from 'react-redux';
import {logout as logoutAction} from '../store/authSlice';
import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store';


export default function Layout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Состояние для отслеживания выхода
  const isLoggedIn = !!getAccessToken();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fullName = useSelector((state: RootState) => state.auth.user?.full_name);
  const isAdmin = useSelector((state: RootState) => state.auth.user?.is_admin);


  const handleLogout = () => {
    logout(); // Очистка токенов из localStorage
    dispatch(logoutAction()); // Сбрасываем состояние аутентификации в Redux
    setIsLoggingOut(true); // Устанавливаем флаг для выхода
  };

  // Используем useEffect для перенаправления после выхода
  useEffect(() => {
    if (isLoggingOut) {
      navigate('/login'); // Перенаправляем на страницу логина после выхода
    }
  }, [isLoggingOut, navigate]); // Зависимость от isLoggingOut

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
            <Button color="inherit" onClick={handleLogout}>
              Выйти
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