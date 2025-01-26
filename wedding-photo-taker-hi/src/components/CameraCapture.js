import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button, Box, IconButton } from '@mui/material';
import styled from 'styled-components';
import { uploadPhoto } from '../api/ApiHelper';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const CameraCapture = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const handleUpload = async () => {
    try {
      const blob = await fetch(capturedImage).then(r => r.blob());
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      await uploadPhoto(file, true);
      setCapturedImage(null);
      alert('Photo uploaded successfully!');
    } catch (err) {
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <CameraContainer>
      {capturedImage ? (
        <Box sx={{ textAlign: 'center' }}>
          <img src={capturedImage} alt="Captured" style={{ maxWidth: '100%' }}/>
          <Box sx={{ mt: 2 }}>
            <IconButton color="success" onClick={handleUpload} size="large">
              <CheckIcon fontSize="large"/>
            </IconButton>
            <IconButton color="error" onClick={() => setCapturedImage(null)} size="large">
              <CancelIcon fontSize="large"/>
            </IconButton>
          </Box>
        </Box>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%' }}
          />
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<CameraAltIcon/>}
              onClick={capture}
              size="large"
            >
              Take Photo
            </Button>
          </Box>
        </>
      )}
    </CameraContainer>
  );
};

export default CameraCapture;