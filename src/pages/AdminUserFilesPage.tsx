import {useEffect, useState} from 'react';
import {
  Container, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, TableContainer, CircularProgress, Alert, Button, Box
} from '@mui/material';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';

interface CustomFile {
  id: string;
  original_name: string;
  size: number;
  comment: string;
  upload_date: string;
  last_download: string;
}

type RouteParams = {
  id: string;
  [key: string]: string | undefined;
};

export default function AdminUserFilesPage() {
  const {id} = useParams<RouteParams>();
  const [files, setFiles] = useState<CustomFile[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1048576).toFixed(2)} MB`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Получаем имя пользователя
        const userResp = await axios.get(`/users/${id}/`);
        setFullName(userResp.data.full_name);

        // Получаем файлы пользователя
        const filesResp = await axios.get(`/storage/?user_id=${id}`);
        setFiles(filesResp.data);
      } catch (err) {
        setError('Ошибка при получении данных о пользователе или его файлах: ' + err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Container sx={{mt: 4}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
        <Typography variant="h5">
          Файлы пользователя: {fullName || `ID ${id}`}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Назад</Button>
      </Box>

      <Box sx={{mb: 2}}>
        <Typography>Всего файлов: {files.length}</Typography>
        <Typography>Общий объём: {formatSize(totalSize)}</Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <CircularProgress sx={{display: 'block', margin: 'auto'}}/>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя файла</TableCell>
                <TableCell>Размер</TableCell>
                <TableCell>Комментарий</TableCell>
                <TableCell>Дата загрузки</TableCell>
                <TableCell>Последняя загрузка</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.original_name}</TableCell>
                  <TableCell>{formatSize(file.size)}</TableCell>
                  <TableCell>{file.comment}</TableCell>
                  <TableCell>{file.upload_date}</TableCell>
                  <TableCell>{file.last_download}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
