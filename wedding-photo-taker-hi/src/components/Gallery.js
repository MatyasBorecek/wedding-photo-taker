import { useEffect, useState, useRef } from "react";
import { 
  Grid, 
  Card, 
  CardMedia, 
  CardActions, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Typography, 
  Box,
  Chip,
  IconButton,
  Fade,
  CircularProgress,
  Alert
} from "@mui/material";
import { 
  Delete, 
  Public, 
  Lock, 
  PhotoLibrary,
  Favorite
} from "@mui/icons-material";
import styled from "styled-components";
import { useTranslation } from 'react-i18next';
import { listPhotos, deletePhoto } from "../api/ApiHelper";
import { useAuth } from '../context/AuthContext';

const GalleryContainer = styled.div`
  padding: 1rem 0;
`;

const StyledCard = styled(Card)`
  transition: all 0.3s ease-in-out !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(51, 158, 95, 0.1) !important;
  
  &:hover {
    transform: translateY(-8px) !important;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
    border-color: rgba(51, 158, 95, 0.3) !important;
  }
`;

const ImageContainer = styled(CardMedia)`
  position: relative;
  height: 280px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%);
    pointer-events: none;
  }
  
  &:hover::after {
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
  }
`;

const ImageOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  z-index: 2;
  
  &:hover {
    opacity: 1;
  }
`;

const PhotoModal = styled(Dialog)`
  .MuiDialog-paper {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 16px !important;
    overflow: hidden;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  height: 280px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const LoadingContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 2rem;
`;

const PAGE_SIZE = 9;

const Gallery = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const loader = useRef();

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        const { data } = await listPhotos();
        setPhotos(data || []);
        setError(null);
      } catch (err) {
        setError(t('gallery.loadFailed'));
        console.error("Failed to load photos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!loader.current) return;
      const rect = loader.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && photos.length > page * PAGE_SIZE) {
        setPage((p) => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [photos, page]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) {
      return;
    }
    try {
      await deletePhoto(deleteId);
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== deleteId));
    } catch (err) {
      console.error(t('gallery.deleteFailed'), err);
    }
    setDeleteId(null);
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalOpen(true);
  };

  const handleCloseModal = () => {
    setPhotoModalOpen(false);
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          {t('gallery.loadingPhotos')}
        </Typography>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 3,
          '& .MuiAlert-message': {
            fontSize: '1rem'
          }
        }}
      >
        {error}
      </Alert>
    );
  }

  if (photos.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center" 
        minHeight="300px"
        textAlign="center"
        sx={{ py: 4 }}
      >
        <PhotoLibrary 
          sx={{ 
            fontSize: 80, 
            color: 'primary.300',
            mb: 2
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 1,
            color: 'text.primary',
            fontWeight: 500
          }}
        >
          {t('gallery.noPhotos')}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 400 }}
        >
          {t('gallery.noPhotos')}
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in timeout={600}>
      <GalleryContainer>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            mb: 4,
            color: 'primary.main',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <Favorite sx={{ color: 'secondary.main' }} />
          {t('gallery.title')}
        </Typography>

        <Grid container spacing={3}>
          {photos.slice(0, page * PAGE_SIZE).map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} key={photo._id}>
              <Fade in timeout={400} style={{ transitionDelay: `${index * 100}ms` }}>
                <StyledCard>
                  {photo.fileName && (photo.fileName.match(/\.(mp4|mov|webm)$/i)) ? (
                    <VideoContainer>
                      <video
                        src={`${process.env.REACT_APP_API_URL}/uploads/${photo.fileName}`}
                        controls
                        preload="metadata"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handlePhotoClick(photo)}
                      />
                    </VideoContainer>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <ImageContainer
                        image={`${process.env.REACT_APP_API_URL}/uploads/${photo.fileName}`}
                        alt={photo.originalName}
                        onClick={() => handlePhotoClick(photo)}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.backgroundImage = `url("https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop")`;
                        }}
                      />
                      <ImageOverlay onClick={() => handlePhotoClick(photo)}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: 'white',
                            fontWeight: 600,
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <PhotoLibrary />
                          {t('gallery.viewFullSize')}
                        </Typography>
                      </ImageOverlay>
                    </Box>
                  )}
                  
                  <CardActions sx={{ 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    py: 1.5
                  }}>
                    <Chip
                      icon={photo.isPublic ? <Public /> : <Lock />}
                      label={photo.isPublic ? t('gallery.public') : t('gallery.private')}
                      size="small"
                      color={photo.isPublic ? "success" : "default"}
                      variant="outlined"
                      sx={{ 
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          fontSize: '1rem'
                        }
                      }}
                    />
                    
                    {(user && (user.role === 'admin' || user._id === photo.owner?._id)) && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(photo._id)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'error.50'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </CardActions>
                </StyledCard>
              </Fade>
            </Grid>
          ))}
        </Grid>
        
        {/* Loader div for lazy loading trigger */}
        <div ref={loader} style={{ height: 20 }} />

        {/* Photo Modal */}
        <PhotoModal 
          open={photoModalOpen} 
          onClose={handleCloseModal}
          maxWidth={false}
        >
          {selectedPhoto && (
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  zIndex: 10,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
              >
                <Box component="span" sx={{ fontSize: '1.5rem' }}>×</Box>
              </IconButton>
              
              {selectedPhoto.fileName && selectedPhoto.fileName.match(/\.(mp4|mov|webm)$/i) ? (
                <video
                  src={`${process.env.REACT_APP_API_URL}/uploads/${selectedPhoto.fileName}`}
                  controls
                  autoPlay
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '80vh',
                    display: 'block'
                  }}
                />
              ) : (
                <img
                  src={`${process.env.REACT_APP_API_URL}/uploads/${selectedPhoto.fileName}`}
                  alt={selectedPhoto.originalName}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '80vh',
                    display: 'block'
                  }}
                />
              )}
              
              <Box sx={{ 
                p: 3, 
                backgroundColor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {selectedPhoto.originalName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={selectedPhoto.isPublic ? <Public /> : <Lock />}
                    label={selectedPhoto.isPublic ? t('gallery.public') : t('gallery.private')}
                    size="small"
                    color={selectedPhoto.isPublic ? "success" : "default"}
                    variant="outlined"
                  />
                  {selectedPhoto.owner && (
                    <Typography variant="body2" color="text.secondary">
                      {t('gallery.uploadedBy')}: {selectedPhoto.owner.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </PhotoModal>

        <Dialog 
          open={!!deleteId} 
          onClose={() => setDeleteId(null)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 320
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 600,
            color: 'error.main'
          }}>
            {t('gallery.deleteConfirm')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '1rem' }}>
              {t('gallery.deleteMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={() => setDeleteId(null)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </GalleryContainer>
    </Fade>
  );
};

export default Gallery;