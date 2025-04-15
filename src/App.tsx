import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {getCurrentUser} from './services/auth';
import AppRoutes from './router';
import {setUser, logout} from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          dispatch(setUser(user));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
        dispatch(logout());
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
