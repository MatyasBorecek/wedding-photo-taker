import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, Switch, FormControlLabel, Alert, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { uploadPhoto } from '../api/ApiHelper';

const DropzoneContainer = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isDragActive',
})(({ theme, isDragActive }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: 8,
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
  margin: '1rem 0',
}));

const PhotoUpload = () => {
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    try {
      setUploading(true);
      for (const file of acceptedFiles) {
        await uploadPhoto(file, isPublic, {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        });
      }
    } catch (err) {
      // Properly handle error object
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Upload failed';
      setError(errorMessage); // Store just the message string
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [isPublic]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <FormControlLabel
        control={
          <Switch
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            color="primary"
          />
        }
        label={isPublic ? 'Public Photo' : 'Private Photo'}
        sx={{ mb: 2 }}
      />

      <DropzoneContainer
        {...getRootProps()}
        isDragActive={isDragActive}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon fontSize="large" sx={{ color: 'text.secondary' }}/>
        <Typography variant="h6" sx={{ mt: 1 }}>
          {isDragActive ? 'Drop photos here' : 'Drag & drop photos or click to select'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Supported formats: JPEG, PNG (Max 10MB per file)
        </Typography>
      </DropzoneContainer>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Uploading... {progress}%
          </Typography>
          <LinearProgress variant="determinate" value={progress}/>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        component="label"
        sx={{ mt: 2 }}
        disabled={uploading}
      >
        Select Files
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(e) => onDrop(Array.from(e.target.files))}
        />
      </Button>
    </Box>
  );
};

export default PhotoUpload;