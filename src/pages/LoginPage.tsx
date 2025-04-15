import {
  Container, TextField, Button, Typography, Box, Alert
} from '@mui/material';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AxiosError} from 'axios';
import {login} from '../services/auth';

export default function LoginPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        setError('Неверное имя пользователя или пароль');
      } else if (error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data) {
        setError(error.response.data.detail as string);
      } else {
        setError('Произошла ошибка при входе в систему');
      }
      console.error('Ошибка при входе:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Typography component="h1" variant="h5">
          Вход в систему
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{mt: 1}}>
          {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Имя пользователя"
            name="username"
            autoComplete="username"
            autoFocus
            value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
