import axios from 'axios';
import {API_URL} from '../config';
import {store} from '../store';
import {setUser, logout as logoutAction} from '../store/authSlice';

// Настройка axios для работы с сессиями
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Функция для получения CSRF-токена из куки
function getCsrfToken() {
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

// Функция для надежной очистки куки
function clearCookie(name: string) {
  const domain = window.location.hostname;
  const paths = ['/', '/api', '/api/v1'];
  
  paths.forEach(path => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  });
}

export async function login(username: string, password: string) {
  try {
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
    
    // Получаем CSRF-токен
    const csrfToken = getCsrfToken();
    
    // Затем отправляем запрос на сервер для очистки сессии
    await axios.post('/users/logout/', {}, {
      headers: {
        'X-CSRFToken': csrfToken
      }
    });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    throw error;
  }
}

// Получение текущего пользователя
export async function getCurrentUser() {
  // Проверяем наличие сессионной куки
  if (!document.cookie.includes('sessionid=')) {
    return null;
  }

  try {
    const response = await axios.get('/users/me/');
    store.dispatch(setUser(response.data));
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    store.dispatch(logoutAction());
    return null;
  }
}