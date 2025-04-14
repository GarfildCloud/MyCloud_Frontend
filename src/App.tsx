import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {getAccessToken, getCurrentUser} from './services/auth';
import AppRoutes from './router';
import {setUser} from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAccessToken();
      if (!token) return; // 🛡️ Не вызывать getCurrentUser, если токена нет
    
      try {
        const user = await getCurrentUser();
        dispatch(setUser(user));
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
