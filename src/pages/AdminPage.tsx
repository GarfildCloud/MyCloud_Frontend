import {useEffect, useState} from 'react';
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, IconButton, Tooltip, CircularProgress,
  Alert, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import {getAccessToken} from '../services/auth';
import axios from 'axios';
import {API_URL} from '../config';
import {useNavigate} from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

export default function AdminPanelPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = getAccessToken();
    return token ? {Authorization: `Bearer ${token}`} : {};
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/users/all/`, {headers});
      setUsers(response.data);
    } catch (err) {
      setError('Не удалось загрузить список пользователей: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/users/${id}/`, {headers});
      setUsers(users.filter(user => user.id !== id));
    } catch {
      setError('Не удалось удалить пользователя');
    }
  };

  const handleToggleAdmin = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(`${API_URL}/users/${id}/admin/`, {}, {headers});
      setUsers(users.map(user => user.id === id ? {...user, is_admin: response.data.is_admin} : user));
    } catch {
      setError('Ошибка при смене статуса администратора');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container sx={{mt: 4}}>
      <Typography variant="h4" gutterBottom>
        Администрирование пользователей
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress sx={{display: 'block', margin: 'auto'}}/>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Логин</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Админ</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.is_admin ? 'Да' : 'Нет'}</TableCell>
                  <TableCell>
                    <Tooltip title="Сменить статус администратора">
                      <IconButton onClick={() => handleToggleAdmin(user.id)}>
                        <AdminPanelSettingsIcon/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить пользователя">
                      <IconButton onClick={() => handleDelete(user.id)}>
                        <DeleteIcon/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Файлы пользователя">
                      <Button onClick={() => navigate(`/admin/files/${user.id}`)}>
                        Файлы
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
