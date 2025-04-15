import {useState, useEffect} from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Alert, CircularProgress,
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import axios from 'axios';
// import {API_URL} from '../config';

import { getCsrfToken } from '../services/auth';

// ✅ Переименованный интерфейс для хранимого файла
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Стейт для отображения окна подтверждения удаления файла
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    fileId: string | null;
    fileName: string;
  }>({open: false, fileId: null, fileName: ''});

  // Стейт для редактирования имени файла
  const [editNameDialog, setEditNameDialog] = useState<{
    open: boolean;
    fileId: string | null;
    originalName: string;
  }>({ open: false, fileId: null, originalName: '' });

  // Стейт для редактирования комментария
  const [editCommentDialog, setEditCommentDialog] = useState<{
    open: boolean;
    fileId: string | null;
    comment: string;
  }>({ open: false, fileId: null, comment: '' });

  const sortFilesByName = (files: StoredFile[]) => {
    return files.sort((a, b) => a.original_name.localeCompare(b.original_name));
  };

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/storage/`);
        setFiles(sortFilesByName(response.data));
      } catch {
        setError('Ошибка при загрузке файлов');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError('Выберите файл для загрузки');
      return;
    }

    const formData = new FormData();
    formData.append('stored_file', uploadFile);
    formData.append('comment', comment);

    setIsLoading(true);

    try {
      const response = await axios.post(`/storage/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': getCsrfToken(),
        },
      });

      setFiles(prev => sortFilesByName([...prev, response.data]));
      setOpenDialog(false);
      setUploadFile(null);
      setComment('');
      setUploadError('');
    } catch {
      setUploadError('Ошибка при загрузке файла');
    } finally {
      setIsLoading(false);
    }
  };

  // Подготовка к удалению — открываем диалог
  const askDeleteFile = (fileId: string, fileName: string) => {
    setConfirmDelete({open: true, fileId, fileName});
  };

  // Удаление файла после подтверждения
  const confirmDeleteFile = async () => {
    if (!confirmDelete.fileId) return;

    setIsLoading(true);
    try {
      await axios.delete(`/storage/${confirmDelete.fileId}/`);
      setFiles(files.filter((file) => file.id !== confirmDelete.fileId));
      setConfirmDelete({open: false, fileId: null, fileName: ''});
    } catch (err) {
      setError('Ошибка при удалении файла: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = async (id: string, originalName: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/storage/${id}/download/`, {
        responseType: 'blob',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(response.data);
      link.download = originalName;
      link.click();
    } catch {
      setError('Ошибка при скачивании файла');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1048576).toFixed(2)} MB`;
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
      .then(() => setSnackbar('Ссылка скопирована'))
      .catch(() => setSnackbar('Не удалось скопировать ссылку'));
  };

  const handleRegenerateLink = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`/storage/${id}/regenerate-link/`);

      setFiles(files.map(f =>
        f.id === id ? {...f, download_url: response.data.download_url} : f
      ));
      setSnackbar('Ссылка обновлена');
    } catch {
      setError('Ошибка при обновлении ссылки');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container sx={{mt: 4}}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Мои файлы</Typography>

        <Tooltip title="Загрузить файл">
          <IconButton color="primary" onClick={() => setOpenDialog(true)}>
            <AddIcon/>
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {snackbar && <Alert onClose={() => setSnackbar('')}>{snackbar}</Alert>}

      {isLoading ? (
        <CircularProgress sx={{display: 'block', margin: 'auto'}}/>
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
              {files.map(file => (
                <TableRow key={file.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {file.original_name}
                      <Tooltip title="Переименовать">
                        <IconButton 
                          size="small"
                          onClick={() => setEditNameDialog({ 
                            open: true, 
                            fileId: file.id, 
                            originalName: file.original_name 
                          })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleCopyLink(file.download_url)}>
                      <ShareIcon/>
                    </IconButton>
                    <Tooltip title="Создать новую публичную ссылку">
                      <IconButton onClick={() => handleRegenerateLink(file.id)}>
                        <RefreshIcon/>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {file.comment}
                      <Tooltip title="Редактировать комментарий">
                        <IconButton 
                          size="small"
                          onClick={() => setEditCommentDialog({ 
                            open: true, 
                            fileId: file.id, 
                            comment: file.comment 
                          })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{file.upload_date}</TableCell>
                  <TableCell>{file.last_download}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDownloadFile(file.id, file.original_name)}>
                      <FileDownloadIcon/>
                    </IconButton>
                    <IconButton onClick={() => askDeleteFile(file.id, file.original_name)}>
                      <DeleteIcon/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({open: false, fileId: null, fileName: ''})}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить файл <strong>{confirmDelete.fileName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({open: false, fileId: null, fileName: ''})}>
            Отмена
          </Button>
          <Button onClick={confirmDeleteFile} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Загрузка нового файла</DialogTitle>
        <DialogContent>
          <Button
            variant="outlined"
            component="label"
            sx={{mb: 2}}
          >
            Выбрать файл
            <input type="file" hidden onChange={handleFileChange}/>
          </Button>

          {uploadFile && (
            <Typography variant="body2" sx={{mb: 2}}>
              Выбран файл: <b>{uploadFile.name}</b>
            </Typography>
          )}

          <TextField
            fullWidth
            label="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {uploadError && (
            <Alert severity="error" sx={{mt: 2}}>
              {uploadError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleUpload} variant="contained">Загрузить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования имени */}
      <Dialog 
        open={editNameDialog.open} 
        onClose={() => setEditNameDialog({ open: false, fileId: null, originalName: '' })}
      >
        <DialogTitle>Переименовать файл</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Новое имя файла"
            value={editNameDialog.originalName}
            onChange={(e) =>
              setEditNameDialog((prev) => ({ ...prev, originalName: e.target.value }))
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditNameDialog({ open: false, fileId: null, originalName: '' })}>
            Отмена
          </Button>
          <Button
            onClick={async () => {
              if (!editNameDialog.fileId) return;
              setIsLoading(true);
              try {
                const response = await axios.patch(`/storage/${editNameDialog.fileId}/`, {
                  original_name: editNameDialog.originalName,
                });
                setFiles((prev) =>
                  sortFilesByName(prev.map((file) =>
                    file.id === editNameDialog.fileId
                      ? { ...file, original_name: response.data.original_name }
                      : file
                  ))
                );
                setEditNameDialog({ open: false, fileId: null, originalName: '' });
              } catch (error) {
                console.error('Ошибка при переименовании файла:', error);
                setError('Ошибка при переименовании файла');
              } finally {
                setIsLoading(false);
              }
            }}
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования комментария */}
      <Dialog 
        open={editCommentDialog.open} 
        onClose={() => setEditCommentDialog({ open: false, fileId: null, comment: '' })}
      >
        <DialogTitle>Редактировать комментарий</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Комментарий"
            value={editCommentDialog.comment}
            onChange={(e) =>
              setEditCommentDialog((prev) => ({ ...prev, comment: e.target.value }))
            }
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCommentDialog({ open: false, fileId: null, comment: '' })}>
            Отмена
          </Button>
          <Button
            onClick={async () => {
              if (!editCommentDialog.fileId) return;
              setIsLoading(true);
              try {
                const response = await axios.patch(`/storage/${editCommentDialog.fileId}/`, {
                  comment: editCommentDialog.comment,
                });
                setFiles((prev) =>
                  sortFilesByName(prev.map((file) =>
                    file.id === editCommentDialog.fileId
                      ? { ...file, comment: response.data.comment }
                      : file
                  ))
                );
                setEditCommentDialog({ open: false, fileId: null, comment: '' });
              } catch (error) {
                console.error('Ошибка при обновлении комментария:', error);
                setError('Ошибка при обновлении комментария');
              } finally {
                setIsLoading(false);
              }
            }}
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
