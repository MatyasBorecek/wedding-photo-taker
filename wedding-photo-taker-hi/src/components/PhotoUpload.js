import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, Switch, FormControlLabel, Alert, LinearProgress, Snackbar } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { uploadPhoto } from '../api/ApiHelper';
import logger from '../utils/logger';

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
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    setSuccess(false);
    try {
      setUploading(true);
      for (const file of acceptedFiles) {
        // Check file size before uploading
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
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
      logger.info('Photos uploaded successfully', { count: acceptedFiles.length });
    } catch (err) {
      // Log the error with context
      logger.error('Photo upload failed', {
        error: err.message,
        stack: err.stack,
        files: acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Use the user-friendly message from the API helper if available
      setError(err.userMessage || err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [isPublic]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*,video/*',
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
          Supported formats: Images and videos (Max 10MB per file)
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
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Upload successful!
        </Alert>
      </Snackbar>

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
