import { useEffect, useState } from "react";
import { Grid, Card, CardMedia, CardActions, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, Box } from "@mui/material";
import styled from "styled-components";
import { listPhotos, deletePhoto } from "../api/ApiHelper";

const GalleryContainer = styled.div`
  padding: 2rem 0;
`;

const StyledCard = styled(Card)`
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled(CardMedia)`
  position: relative;
  height: 250px;
  background-size: cover;
  background-position: center;
`;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        setLoading(true);
        const { data } = await listPhotos();
        setPhotos(data);
        setError(null);
      } catch (err) {
        setError("Failed to load photos. Please try again later.");
        console.error("Failed to load photos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deletePhoto(deleteId);
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== deleteId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleteId(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading photos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No photos yet. Start by taking or uploading some photos!</Typography>
      </Box>
    );
  }

  return (
    <GalleryContainer>
      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <StyledCard>
              <ImageContainer
                image={`${process.env.REACT_APP_API_URL}/uploads/${photo.fileName}`}
                alt={photo.originalName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
              <CardActions>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => setDeleteId(photo._id)}
                >
                  Delete
                </Button>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                  {photo.isPublic ? 'Public' : 'Private'}
                </Typography>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this photo? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </GalleryContainer>
  );
};

export default Gallery;