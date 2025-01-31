import { useEffect, useState, useRef } from "react";
import { Grid, Card, CardMedia, CardActions, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import styled from "styled-components";
import { listPhotos, deletePhoto } from "../api/ApiHelper";

const GalleryContainer = styled.div`
  padding: 2rem 0;
`;

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const isFetchedRef = useRef(false);

  useEffect(() => {
    if (isFetchedRef.current) return; // Prevent multiple calls
    isFetchedRef.current = true;

    const loadPhotos = async () => {
      try {
        const { data } = await listPhotos();
        setPhotos(data);
      } catch (err) {
        console.error("Failed to load photos:", err);
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
      console.error("Delete failed. Please try again.");
    }
    setDeleteId(null);
  };

  return (
    <GalleryContainer>
      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Card>
              <CardMedia
                component="img"
                image={`${process.env.REACT_APP_API_URL}/uploads/${photo.fileName}`}
                alt={photo.originalName}
                sx={{ height: 250, objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/fallback-image.jpg";
                }}
              />
              <CardActions>
                <Button size="small" color="error" onClick={() => setDeleteId(photo._id)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this photo?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </GalleryContainer>
  );
};

export default Gallery;
