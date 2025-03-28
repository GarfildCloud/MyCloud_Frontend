import axios from 'axios';
import {API_URL} from '../config';
import {store} from '../store';
import {setUser} from '../store/authSlice';

export async function login(username: string, password: string) {
  const response = await axios.post(`${API_URL}/users/token/`, {
    username,
    password,
  });

  const { access, refresh } = response.data;

  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);

  // ✅ Получаем пользователя по токену и сохраняем в Redux
  await getCurrentUser();
}




// ✅ Получение access-токена
export function getAccessToken(): string | null {
  return localStorage.getItem('access');
}

// ✅ Выход из системы
export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

// Получение текущего пользователя
export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('access');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Сохраняем пользователя в Redux Store
    store.dispatch(setUser(response.data));
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
}