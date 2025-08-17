// src/pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogTitle, 
  IconButton, 
  Switch, 
  Tooltip,
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Alert
} from '@mui/material';
import { 
  Delete, 
  Visibility, 
  AdminPanelSettings,
  Public,
  Lock,
  PhotoLibrary,
  VideoLibrary
} from '@mui/icons-material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { listPhotos, deletePhoto, updatePhoto } from '../api/ApiHelper';

const AdminContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f4 0%, #fefffe 100%);
  padding: 2rem 1rem;
`;

const HeaderSection = styled(Paper)`
  background: linear-gradient(135deg, #339e5f 0%, #268049 100%) !important;
  color: white !important;
  padding: 2rem !important;
  margin-bottom: 2rem !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(51, 158, 95, 0.2) !important;
`;

const DataGridContainer = styled(Paper)`
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  
  .MuiDataGrid-root {
    border: none !important;
  }
  
  .MuiDataGrid-columnHeaders {
    background: linear-gradient(135deg, #f8fffe 0%, #f0f9f4 100%) !important;
    border-bottom: 2px solid #339e5f !important;
  }
  
  .MuiDataGrid-columnHeaderTitle {
    font-weight: 600 !important;
    color: #268049 !important;
  }
  
  .MuiDataGrid-row:hover {
    background-color: rgba(51, 158, 95, 0.05) !important;
  }
`;

const ThumbnailContainer = styled(Box)`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewModal = styled(Dialog)`
  .MuiDialog-paper {
    max-width: 90vw !important;
    max-height: 90vh !important;
    border-radius: 16px !important;
    overflow: hidden !important;
  }
`;

const StatsContainer = styled(Box)`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const StatCard = styled(Paper)`
  padding: 1.5rem !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(51, 158, 95, 0.1) !important;
  min-width: 150px !important;
  text-align: center !important;
`;

const AdminPanel = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        // Use regular photos endpoint instead of admin endpoint
        const { data } = await listPhotos();
        setPhotos(data || []);
        setError(null);
      } catch (err) {
        if (err.response?.status === 403) {
          setError(t('admin.accessDenied'));
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setError(err.userMessage || t('gallery.loadFailed'));
        }
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, [navigate, t]);

  const handleDelete = async () => {
    try {
      await deletePhoto(selectedPhoto._id);
      setPhotos(photos.filter(photo => photo._id !== selectedPhoto._id));
      setOpenDeleteDialog(false);
      setSelectedPhoto(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleVisibilityChange = async (photoId, isPublic) => {
    try {
      await updatePhoto(photoId, { isPublic });
      setPhotos(photos.map(photo =>
        photo._id === photoId ? { ...photo, isPublic } : photo
      ));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handlePreview = (photo) => {
    setSelectedPhoto(photo);
    setPreviewOpen(true);
  };

  const getFileIcon = (fileName) => {
    if (fileName && fileName.match(/\.(mp4|mov|webm|avi)$/i)) {
      return <VideoLibrary sx={{ color: 'primary.main' }} />;
    }
    return <PhotoLibrary sx={{ color: 'primary.main' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stats = {
    total: photos.length,
    public: photos.filter(p => p.isPublic).length,
    private: photos.filter(p => !p.isPublic).length,
    videos: photos.filter(p => p.fileName && p.fileName.match(/\.(mp4|mov|webm|avi)$/i)).length
  };

  if (loading) {
    return (
      <AdminContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h6">{t('common.loading')}</Typography>
        </Box>
      </AdminContainer>
    );
  }

  if (error) {
    return (
      <AdminContainer>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </AdminContainer>
    );
  }

  const columns = [
    {
      field: 'preview',
      headerName: t('admin.preview'),
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <ThumbnailContainer onClick={() => handlePreview(params.row)}>
          {params.row.fileName && params.row.fileName.match(/\.(mp4|mov|webm|avi)$/i) ? (
            <video
              src={`${process.env.REACT_APP_API_URL}/uploads/${params.row.fileName}`}
              muted
              preload="metadata"
            />
          ) : (
            <img
              src={`${process.env.REACT_APP_API_URL}/uploads/${params.row.fileName}`}
              alt="thumbnail"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop";
              }}
            />
          )}
        </ThumbnailContainer>
      )
    },
    {
      field: 'originalName',
      headerName: t('admin.originalName'),
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getFileIcon(params.row.fileName)}
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'owner',
      headerName: t('admin.uploadedBy'),
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {params.value?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant="body2">
            {params.value?.name || 'Unknown'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'isPublic',
      headerName: t('admin.visibility'),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={params.value}
            onChange={(e) => handleVisibilityChange(params.row._id, e.target.checked)}
            color="primary"
            size="small"
          />
          <Chip
            icon={params.value ? <Public /> : <Lock />}
            label={params.value ? t('gallery.public') : t('gallery.private')}
            size="small"
            color={params.value ? "success" : "default"}
            variant="outlined"
          />
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: t('admin.uploadDate'),
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(params.value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('admin.actions'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('admin.preview')}>
            <IconButton 
              size="small"
              onClick={() => handlePreview(params.row)}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.50' }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete')}>
            <IconButton 
              size="small"
              onClick={() => {
                setSelectedPhoto(params.row);
                setOpenDeleteDialog(true);
              }}
              sx={{ 
                color: 'error.main',
                '&:hover': { backgroundColor: 'error.50' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <AdminContainer>
      <HeaderSection elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('admin.title')}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {t('admin.photoManagement')}
            </Typography>
          </Box>
        </Box>
      </HeaderSection>

      <StatsContainer>
        <StatCard elevation={0}>
          <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}>
            {stats.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Photos
          </Typography>
        </StatCard>
        
        <StatCard elevation={0}>
          <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700, mb: 1 }}>
            {stats.public}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Public
          </Typography>
        </StatCard>
        
        <StatCard elevation={0}>
          <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700, mb: 1 }}>
            {stats.private}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Private
          </Typography>
        </StatCard>
        
        <StatCard elevation={0}>
          <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 700, mb: 1 }}>
            {stats.videos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Videos
          </Typography>
        </StatCard>
      </StatsContainer>

      <DataGridContainer elevation={0}>
        <DataGrid
          rows={photos}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50]}
          getRowId={(row) => row._id}
          disableSelectionOnClick
          autoHeight
          rowHeight={80}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
        />
      </DataGridContainer>

      {/* Preview Modal */}
      <PreviewModal 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        maxWidth={false}
      >
        {selectedPhoto && (
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => setPreviewOpen(false)}
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
            
            {selectedPhoto.fileName && selectedPhoto.fileName.match(/\.(mp4|mov|webm|avi)$/i) ? (
              <video
                src={`${process.env.REACT_APP_API_URL}/uploads/${selectedPhoto.fileName}`}
                controls
                autoPlay
                style={{ 
                  width: '100%', 
                  height: 'auto',
                  maxHeight: '70vh',
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
                  maxHeight: '70vh',
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
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {selectedPhoto.originalName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={selectedPhoto.isPublic ? <Public /> : <Lock />}
                  label={selectedPhoto.isPublic ? t('gallery.public') : t('gallery.private')}
                  color={selectedPhoto.isPublic ? "success" : "default"}
                  variant="outlined"
                />
                {selectedPhoto.owner && (
                  <Typography variant="body2" color="text.secondary">
                    {t('gallery.uploadedBy')}: {selectedPhoto.owner.name}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {new Date(selectedPhoto.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </PreviewModal>

      {/* Delete Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
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
          {t('admin.deleteConfirm')}
        </DialogTitle>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminContainer>
  );
};
  width: 100%;
`;

const AdminPanel = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const { data } = await listPhotos();
        setPhotos(data);
      } catch (err) {
        if (err.response?.status === 403) {
          navigate('/dashboard');
        }
      }
    };
    loadPhotos();
  }, []);

  const handleDelete = async () => {
    try {
      await deletePhoto(selectedPhoto);
      setPhotos(photos.filter(photo => photo._id !== selectedPhoto));
      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleVisibilityChange = async (photoId, isPublic) => {
    try {
      await updatePhoto(photoId, { isPublic });
      setPhotos(photos.map(photo =>
        photo._id === photoId ? { ...photo, isPublic } : photo
      ));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const columns = [
    {
      field: 'fileName',
      headerName: 'Photo',
      width: 200,
      renderCell: (params) => (
        <img
          src={`${process.env.REACT_APP_API_URL}/${params.value}`}
          alt="thumbnail"
          style={{ height: 50, width: 50, objectFit: 'cover' }}
        />
      )
    },
    { field: 'originalName', headerName: 'Original Name', width: 200 },
    { field: 'owner.name', headerName: 'Uploaded By', width: 150 },
    {
      field: 'isPublic',
      headerName: 'Public',
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleVisibilityChange(params.row._id, e.target.checked)}
          color="primary"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Upload Date',
      width: 180,
      valueGetter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Preview">
            <IconButton onClick={() => window.open(`${process.env.REACT_APP_API_URL}/${params.row.fileName}`, '_blank')}>
              <Visibility/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => {
              setSelectedPhoto(params.row._id);
              setOpenDeleteDialog(true);
            }}>
              <Delete color="error"/>
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <AdminContainer>
      <h1>Admin Photo Management</h1>
      <div style={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={photos}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          getRowId={(row) => row._id}
          disableSelectionOnClick
        />
      </div>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete this photo permanently?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminContainer>
  );
};

export default AdminPanel;