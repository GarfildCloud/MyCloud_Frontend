import { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, IconButton, Tooltip, CircularProgress,
  Alert, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Иконка "Назад"
import { getAccessToken } from '../services/auth';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';

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

  // Модалка подтверждения удаления
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    userId: number | null;
    username: string;
  }>({ open: false, userId: null, username: '' });

  const getAuthHeaders = () => {
    const token = getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/users/all/`, { headers });
      setUsers(response.data);
    } catch (err) {
      setError('Не удалось загрузить список пользователей: ' + err);
    } finally {
      setLoading(false);
    }
  }, []);

  const askDeleteUser = (userId: number, username: string) => {
    setConfirmDelete({ open: true, userId, username });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete.userId) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/users/${confirmDelete.userId}/`, { headers });
      setUsers(users.filter(user => user.id !== confirmDelete.userId));
      setConfirmDelete({ open: false, userId: null, username: '' });
    } catch {
      setError('Не удалось удалить пользователя');
    }
  };

  const handleToggleAdmin = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(`${API_URL}/users/${id}/admin/`, {}, { headers });
      setUsers(users.map(user => user.id === id ? { ...user, is_admin: response.data.is_admin } : user));
    } catch {
      setError('Ошибка при смене статуса администратора');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Кнопка "Назад" */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Назад
      </Button>

      <Typography variant="h4" gutterBottom>
        Администрирование пользователей
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
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
                        <AdminPanelSettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить пользователя">
                      <IconButton onClick={() => askDeleteUser(user.id, user.username)}>
                        <DeleteIcon />
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

      {/* Модальное окно подтверждения удаления пользователя */}
      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, userId: null, username: '' })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить пользователя <b>{confirmDelete.username}</b>? Это действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, userId: null, username: '' })}>
            Отмена
          </Button>
          <Button onClick={confirmDeleteUser} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
