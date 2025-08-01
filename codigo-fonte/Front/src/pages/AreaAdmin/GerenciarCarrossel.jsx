import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Box, Button, Card, CardMedia, CardActions, Typography, Grid,
  CircularProgress, Backdrop, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField, // <-- Importa o TextField
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight);
}

const GerenciarCarrossel = () => {
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  // eslint-disable-next-line no-unused-vars
  const [aspect, setAspect] = useState(16 / 9);

  const [linkParaImagem, setLinkParaImagem] = useState('');

  const fetchImagens = async () => {
    try { setLoading(true); const response = await api.get('/api/carrossel'); setImagens(response.data); }
    catch (err) { console.error("Erro:", err); setError("Erro ao carregar imagens."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchImagens() }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza?")) return;
    try { await api.delete(`/api/carrossel/${id}`); fetchImagens(); alert("Deletado!"); }
    catch { alert("Falha ao deletar."); }
  };

  const handleAddClick = () => { fileInputRef.current.click(); };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setModalOpen(true);
    }
  };

  function onImageLoad(e) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const handleConfirmUpload = async () => {
    const image = imgRef.current;
    const file = fileInputRef.current?.files?.[0];

    if (!completedCrop || !file || !image) {
      alert("Erro: Ação inválida. Selecione uma imagem e uma área de corte.");
      return;
    }

    setIsUploading(true);
    setModalOpen(false);

    try {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const scaledCropData = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY
      };

      const formData = new FormData();
      formData.append('image', file);
      formData.append('crop', JSON.stringify(scaledCropData));

      if (linkParaImagem) {
        formData.append('link', linkParaImagem);
      }

      await api.post('/api/carrossel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Imagem salva com sucesso!');
      fetchImagens();

    } catch (err) {
      const errorMessage = err.response?.data?.error || "Falha ao processar a imagem.";
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      setImgSrc('');
      setLinkParaImagem('');
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 3, minHeight: '450px' }}>
      <Backdrop open={isUploading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ ml: 2 }}>Processando imagem...</Typography>
      </Backdrop>
      <Typography variant="h4" gutterBottom>Gerenciar Carrossel da Home</Typography>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" />
      <Typography variant="body1" color="text.secondary" gutterBottom>Você pode ter no máximo 3 imagens.</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {imagens.map((imagem) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={imagem.id}>
            <Card>
              <CardMedia component="img" height="200" image={imagem.urls.medium} alt={`Slide ${imagem.posicao + 1}`} />
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(imagem.id)}>Deletar</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {imagens.length < 3 && (
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card onClick={handleAddClick} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 248, border: '2px dashed #ccc', cursor: 'pointer', '&:hover': { backgroundColor: '#f9f9f9' } }}>
              <Box sx={{ textAlign: 'center' }}><AddPhotoAlternateIcon sx={{ fontSize: 50, color: '#ccc' }} /><Typography>Adicionar Nova Imagem</Typography></Box>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md">
        <DialogTitle>Ajuste a Imagem do Carrossel</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>Selecione e arraste a área que deseja exibir.</DialogContentText>
          {imgSrc && (
            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={aspect} minWidth={100}>
              <img ref={imgRef} alt="Crop preview" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
            </ReactCrop>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="link"
            label="Link de destino (opcional)"
            placeholder="/produto/id-do-produto"
            type="text"
            fullWidth
            variant="standard"
            value={linkParaImagem}
            onChange={(e) => setLinkParaImagem(e.target.value)}
            sx={{ mt: 3 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmUpload} variant="contained">Confirmar e Salvar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GerenciarCarrossel;