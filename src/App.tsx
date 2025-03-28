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
      const user = await getCurrentUser();
      if (user) {
        dispatch(setUser(user));
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
