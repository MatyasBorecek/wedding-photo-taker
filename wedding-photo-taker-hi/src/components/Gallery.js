import React, { useEffect, useState } from 'react';
import { Grid, Card, CardMedia, CardActions, Button } from '@mui/material';
import styled from 'styled-components';
import { listPhotos, deletePhoto } from '../api/ApiHelper';

const GalleryContainer = styled.div`
  padding: 2rem 0;
`;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const { data } = await listPhotos();
        setPhotos(data);
      } catch (err) {
        console.error('Failed to load photos:', err);
      }
    };
    loadPhotos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(id);
        setPhotos(photos.filter(photo => photo._id !== id));
      } catch (err) {
        alert('Delete failed. Please try again.');
      }
    }
  };

  return (
    <GalleryContainer>
      <Grid container spacing={3}>
        {photos.map(photo => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Card>
              <CardMedia
                component="img"
                image={`${process.env.REACT_APP_API_URL}/${photo.fileName}`}
                alt={photo.originalName}
                sx={{ height: 250, objectFit: 'cover' }}
              />
              <CardActions>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(photo._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </GalleryContainer>
  );
};

export default Gallery;