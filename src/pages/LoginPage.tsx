import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {TextField, Button, Container, Typography, Box, Alert} from '@mui/material';
import {login} from '../services/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password); // ✅ этого достаточно
      navigate('/dashboard');

    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else {
        setError('Ошибка входа. Попробуйте позже.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{mt: 8}}>
        <Typography variant="h5" align="center" gutterBottom>
          Вход
        </Typography>
        {error && (
          <Alert severity="error" sx={{mb: 2}}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Логин"
            fullWidth
            margin="normal"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{mt: 2}}
          >
            Войти
          </Button>
        </form>
      </Box>
    </Container>
  );
}
