import { useState, useEffect } from 'react';
import {
  Container, Typography, Button, TextField, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Alert, CircularProgress, Tooltip, Snackbar
} from '@mui/material';
import { getAccessToken } from '../services/auth';
import axios from 'axios';
import { API_URL } from '../config';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';

// ✅ Новый интерфейс (чтобы не конфликтовал с DOM File)
interface StoredFile {
  id: string;
  original_name: string;
  size: number;
  comment: string;
  upload_date: string;
  last_download: string;
  download_url: string;
}

export default function DashboardPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null); // ✅ Тип File из DOM
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: ''
  });

  const showSnackbar = (message: string) => {
    setSnackbar({ open: true, message });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '' });
  };

  const getAuthHeaders = () => {
    const token = getAccessToken();
    if (!token) {
      setError("Пользователь не авторизован");
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  const sortFilesByName = (files: StoredFile[]) => {
    return files.sort((a, b) => a.original_name.localeCompare(b.original_name));
  };

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_URL}/storage/`, { headers });
        setFiles(sortFilesByName(response.data));
      } catch (err) {
        setError('Ошибка при загрузке файлов: ' + err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('stored_file', uploadFile);
    formData.append('comment', comment);

    setIsLoading(true);

    try {
      const headers = getAuthHeaders();
      const response = await axios.post(`${API_URL}/storage/`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFiles((prevFiles) => sortFilesByName([...prevFiles, response.data]));
      setUploadFile(null);
      setComment('');
    } catch (err) {
      setError('Ошибка при загрузке файла: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/storage/${fileId}/`, { headers });
      setFiles(files.filter((file) => file.id !== fileId));
    } catch (err) {
      setError('Ошибка при удалении файла: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = async (file: StoredFile) => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/storage/${file.id}/download/`, {
        headers,
        responseType: 'blob',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(response.data);
      link.download = file.original_name;
      link.click();
    } catch (err) {
      setError('Ошибка при скачивании файла: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    else return `${(size / 1048576).toFixed(2)} MB`;
  };

  const handleCopyLink = (publicLink: string) => {
    navigator.clipboard.writeText(publicLink)
      .then(() => showSnackbar("Ссылка скопирована в буфер обмена"))
      .catch((err) => showSnackbar("Ошибка при копировании ссылки: " + err));
  };

  const handleRegenerateLink = async (fileId: string) => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await axios.patch(`${API_URL}/storage/${fileId}/regenerate-link/`, {}, { headers });

      setFiles(prev =>
        prev.map(file =>
          file.id === fileId ? { ...file, download_url: response.data.download_url } : file
        )
      );

      showSnackbar("Публичная ссылка обновлена");
    } catch (err) {
      setError("Ошибка при перегенерации ссылки: " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Мои файлы
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ mb: 4 }}>
        <TextField
          label="Комментарий"
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Выбрать файл
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        {uploadFile && (
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleUploadFile}>
            Загрузить файл
          </Button>
        )}
      </Box>

      <Typography variant="h6" gutterBottom>
        Список файлов
      </Typography>

      {isLoading ? (
        <CircularProgress sx={{ display: 'block', margin: 'auto' }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя файла</TableCell>
                <TableCell>Публичная ссылка</TableCell>
                <TableCell>Размер</TableCell>
                <TableCell>Комментарий</TableCell>
                <TableCell>Дата загрузки</TableCell>
                <TableCell>Последняя загрузка</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.original_name}</TableCell>
                  <TableCell>
                    <Tooltip title="Скопировать публичную ссылку">
                      <IconButton onClick={() => handleCopyLink(file.download_url)}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Создать новую публичную ссылку">
                      <IconButton onClick={() => handleRegenerateLink(file.id)}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{file.comment}</TableCell>
                  <TableCell>{file.upload_date}</TableCell>
                  <TableCell>{file.last_download}</TableCell>
                  <TableCell>
                    <Tooltip title="Скачать файл">
                      <IconButton onClick={() => handleDownloadFile(file)}>
                        <FileDownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить файл">
                      <IconButton onClick={() => handleDeleteFile(file.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Container>
  );
}
