import {
  Container, TextField, Button, Typography, Box, Alert
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../config';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{3,19}$/;
    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

    if (!usernameRegex.test(form.username)) {
      return 'Логин должен быть от 4 до 20 символов, начинаться с буквы, только латиница и цифры';
    }
    if (!emailRegex.test(form.email)) {
      return 'Некорректный email';
    }
    if (!passwordRegex.test(form.password)) {
      return 'Пароль: минимум 6 символов, одна заглавная, одна цифра, один спецсимвол';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const err = validate();
    if (err) return setError(err);

    try {
      await axios.post(`${API_URL}/users/register/`, form);
      navigate('/login');
    } catch (err) {
      const error = err as AxiosError<{ detail: string }>;
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Ошибка регистрации. Проверьте данные.');
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Регистрация
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Логин"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Полное имя"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Зарегистрироваться
          </Button>
        </form>
      </Box>
    </Container>
  );
}
