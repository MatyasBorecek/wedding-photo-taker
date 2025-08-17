import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Button, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Alert, 
  LinearProgress, 
  Snackbar,
  Paper,
  Fade
} from '@mui/material';
import { CloudUpload, PhotoCamera, VideoLibrary } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { uploadPhoto } from '../api/ApiHelper';
import logger from '../utils/logger';

const DropzoneContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDragActive',
})(({ theme, isDragActive }) => ({
  border: `3px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.primary[300]}`,
  borderRadius: 16,
  padding: '3rem 2rem',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? theme.palette.primary[50] : theme.palette.grey[50],
  margin: '1.5rem 0',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary[50],
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(51, 158, 95, 0.15)'
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${theme.palette.primary[100]}, transparent)`,
    transition: 'left 0.5s',
  },
  
  '&:hover::before': {
    left: '100%'
  }
}));

const UploadIconContainer = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .upload-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #339e5f 0%, #268049 100%);
    color: white;
    animation: pulse 2s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: -0.5s;
    }
    
    &:nth-child(3) {
      animation-delay: -1s;
    }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;

const PhotoUpload = () => {
  const { t } = useTranslation();
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    setSuccess(false);
    try {
      setUploading(true);
      for (const file of acceptedFiles) {
        // Check file size before uploading
        if (file.size > 100 * 1024 * 1024) { // 100MB limit
          throw new Error(t('upload.fileTooLarge', { fileName: file.name }));
        }

        await uploadPhoto(file, isPublic, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        });
      }
      setProgress(0);
      setSuccess(true);
      logger.info('Photos uploaded successfully', { 
        count: acceptedFiles.length,
        isPublic 
      });
    } catch (err) {
      // Log the error with context
      logger.error('Photo upload failed', {
        error: err.message,
        stack: err.stack,
        files: acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Use the user-friendly message from the API helper if available
      setError(err.userMessage || err.message || t('upload.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }, [isPublic]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true
  });

  return (
    <Fade in timeout={600}>
      <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            mb: 3,
            color: 'primary.main',
            fontWeight: 600
          }}
        >
          {t('upload.title')}
        </Typography>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: 'grey.200',
            mb: 3
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                color="primary"
                size="medium"
              />
            }
            label={
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {isPublic ? t('upload.publicPhoto') : t('upload.privatePhoto')}
              </Typography>
            }
            sx={{ mb: 2 }}
          />

          <DropzoneContainer
            {...getRootProps()}
            isDragActive={isDragActive}
          >
            <input {...getInputProps()} />
            
            <UploadIconContainer>
              <Box className="upload-icon">
                <CloudUpload />
              </Box>
              <Box className="upload-icon">
                <PhotoCamera />
              </Box>
              <Box className="upload-icon">
                <VideoLibrary />
              </Box>
            </UploadIconContainer>
            
            <Typography 
              variant="h5" 
              sx={{ 
                mt: 1,
                fontWeight: 600,
                color: isDragActive ? 'primary.main' : 'text.primary'
              }}
            >
              {isDragActive ? t('upload.dragDropActive') : t('upload.dragDrop')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 2, 
                color: 'text.secondary',
                maxWidth: 400,
                mx: 'auto'
              }}
            >
              {t('upload.supportedFormats')}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                color: 'text.secondary',
                fontSize: '0.875rem',
                opacity: 0.8
              }}
            >
              JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM
            </Typography>
          </DropzoneContainer>
        </Paper>

        {uploading && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'primary.200',
              backgroundColor: 'primary.50',
              mb: 2
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                fontWeight: 500,
                color: 'primary.main'
              }}
            >
              {t('upload.uploading')} {progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ 
                height: 8,
                borderRadius: 4,
                backgroundColor: 'primary.100',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4
                }
              }}
            />
          </Paper>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Button
          variant="outlined"
          component="label"
          size="large"
          disabled={uploading}
          startIcon={<CloudUpload />}
          sx={{ 
            mt: 3,
            py: 1.5,
            px: 3,
            fontSize: '1rem',
            fontWeight: 600,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          {t('upload.selectFiles')}
          <input
            type="file"
            hidden
            multiple
            accept="image/*,video/*"
            onChange={(e) => onDrop(Array.from(e.target.files))}
          />
        </Button>

        <Snackbar
          open={success}
          autoHideDuration={4000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSuccess(false)} 
            severity="success" 
            sx={{ 
              width: '100%',
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }}
          >
            {t('upload.uploadSuccess')}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default PhotoUpload;