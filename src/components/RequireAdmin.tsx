import {useSelector} from 'react-redux';
import {Navigate} from 'react-router-dom';
import {RootState} from '../store';

export default function RequireAdmin({children}: { children: React.ReactElement }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/" replace/>;
  }

  return children;
}
