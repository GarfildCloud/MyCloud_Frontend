import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {getCurrentUser} from './services/auth';
import AppRoutes from './router';
import {setUser} from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      // Проверяем наличие сессионной куки
      const hasSession = document.cookie.includes('sessionid=');
      if (!hasSession) return;

      try {
        const user = await getCurrentUser();
        if (user) {
          dispatch(setUser(user));
        }
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );
}

export default App;
