import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { 
  Button, 
  Box, 
  IconButton, 
  Typography, 
  Paper, 
  Fade,
  Alert
} from '@mui/material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { uploadPhoto } from '../api/ApiHelper';
import { 
  CameraAlt, 
  Check, 
  Cancel, 
  Refresh,
  PhotoCamera 
} from '@mui/icons-material';

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

const CameraFrame = styled(Paper)`
  border-radius: 20px !important;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
  background: #000 !important;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 3px solid transparent;
    border-radius: 20px;
    background: linear-gradient(45deg, #339e5f, #268049) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    z-index: 1;
    pointer-events: none;
  }
`;

const ActionButton = styled(IconButton)`
  width: 64px !important;
  height: 64px !important;
  margin: 0 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s ease-in-out !important;
  
  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2) !important;
  }
`;

const CameraCapture = () => {
  const { t } = useTranslation();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const capture = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setError('');
    } catch (err) {
      setError(t('camera.cameraError'));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setError('');
    try {
      const blob = await fetch(capturedImage).then(r => r.blob());
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      await uploadPhoto(file, true);
      setCapturedImage(null);
      // Show success message through parent component or global notification
    } catch (err) {
      setError(err.userMessage || t('upload.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Fade in timeout={600}>
      <CameraContainer>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            mb: 3,
            color: 'primary.main',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <PhotoCamera />
          {t('camera.title')}
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3
            }}
          >
            {error}
          </Alert>
        )}

        {capturedImage ? (
          <Box sx={{ textAlign: 'center' }}>
            <CameraFrame elevation={0}>
              <img 
                src={capturedImage} 
                alt={t('camera.title')} 
                style={{ 
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </CameraFrame>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <ActionButton 
                color="success" 
                onClick={handleUpload}
                disabled={uploading}
                sx={{ 
                  backgroundColor: 'success.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'success.dark'
                  }
                }}
              >
                <Check fontSize="large"/>
              </ActionButton>
              
              <ActionButton 
                color="error" 
                onClick={() => {
                  setCapturedImage(null);
                  setError('');
                }}
                disabled={uploading}
                sx={{ 
                  backgroundColor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'error.dark'
                  }
                }}
              >
                <Cancel fontSize="large"/>
              </ActionButton>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2,
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <span>✓ {uploading ? t('upload.uploading') : t('camera.upload')}</span>
              <span>✗ {t('camera.retake')}</span>
            </Typography>
          </Box>
        ) : (
          <>
            <CameraFrame elevation={0}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ 
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "user"
                }}
                onUserMediaError={() => setError(t('camera.permissionDenied'))}
              />
            </CameraFrame>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                startIcon={<CameraAlt/>}
                onClick={capture}
                size="large"
                sx={{ 
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3
                }}
              >
                {t('camera.takePhoto')}
              </Button>
            </Box>
          </>
        )}
      </CameraContainer>
    </Fade>
  );
};

export default CameraCapture;