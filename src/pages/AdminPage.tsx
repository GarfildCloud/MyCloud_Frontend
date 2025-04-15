import { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, IconButton, Tooltip, CircularProgress,
  Alert, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Иконка "Назад"
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  full_name: string;
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
    userName: string;
  }>({ open: false, userId: null, userName: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users/all/');
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка при загрузке списка пользователей: ' + err);
    } finally {
      setLoading(false);
    }
  }, []);

  const askDeleteUser = (userId: number, userName: string) => {
    setConfirmDelete({ open: true, userId, userName });
  };

  const confirmDeleteUser = async () => {
    if (!confirmDelete.userId) return;
    try {
      await axios.delete(`/users/${confirmDelete.userId}/`);
      setUsers(users.filter(user => user.id !== confirmDelete.userId));
      setConfirmDelete({ open: false, userId: null, userName: '' });
    } catch (err) {
      setError('Ошибка при удалении пользователя: ' + err);
    }
  };

  const handleToggleAdmin = async (id: number) => {
    setLoading(true);
    try {
      const response = await axios.patch(`/users/${id}/admin/`);
      setUsers(users.map(user => user.id === id ? { ...user, is_admin: response.data.is_admin } : user));
    } catch (err) {
      setError('Ошибка при изменении прав администратора: ' + err);
    } finally {
      setLoading(false);
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
        onClose={() => setConfirmDelete({ open: false, userId: null, userName: '' })}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить пользователя <b>{confirmDelete.userName}</b>? Это действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, userId: null, userName: '' })}>
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
