import axios from 'axios';
import {API_URL} from '../config';
import {store} from '../store';
import {setUser, logout as logoutAction} from '../store/authSlice';

// Настройка axios для работы с сессиями
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Функция для получения CSRF-токена из куки
export function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Добавляем CSRF-токен для всех изменяющих запросов
axios.interceptors.request.use(config => {
  const csrfToken = getCsrfToken();
  // Не добавляем CSRF-токен только для регистрации
  const isRegisterRequest = config.url?.includes('/users/register/');
  if (csrfToken && !isRegisterRequest && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Функция для получения CSRF-токена
async function fetchCsrfToken() {
  try {
    const response = await axios.get('/users/csrf/');
    // Проверяем, что кука установлена
    if (!document.cookie.includes('csrftoken=')) {
      throw new Error('CSRF token not set');
    }
    return response;
  } catch (error) {
    console.error('Ошибка при получении CSRF-токена:', error);
    throw error;
  }
}

export async function login(username: string, password: string) {
  try {
    // Получаем CSRF-токен перед входом и ждем его установки
    await fetchCsrfToken();
    
    // Делаем небольшую паузу, чтобы убедиться, что кука установлена
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await axios.post('/users/login/', {
      username,
      password,
    });

    // Сохраняем пользователя в Redux
    store.dispatch(setUser(response.data));
    return response.data;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
}

export async function register(username: string, password: string, email: string, full_name: string) {
  try {
    const response = await axios.post('/users/register/', {
      username,
      password,
      email,
      full_name,
    });

    // После успешной регистрации пользователь автоматически входит
    store.dispatch(setUser(response.data));
    return response.data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
}

export async function logout() {
  try {
    // Сначала очищаем состояние в Redux
    store.dispatch(logoutAction());
    
    // Удаляем csrftoken куку
    document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Затем отправляем запрос на сервер для очистки сессии
    await axios.get('/users/logout/');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    throw error;
  }
}

// Получение текущего пользователя
export async function getCurrentUser() {
  const hasSession = document.cookie.includes('csrftoken=');
  if (!hasSession) {
    return null;
  }

  try {
    const response = await axios.get('/users/me/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
}