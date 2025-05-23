// src/pages/AdminPanel.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogTitle, IconButton, Switch, Tooltip } from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import styled from 'styled-components';
import { listPhotos, deletePhoto, updatePhoto } from '../api/ApiHelper';

const AdminContainer = styled.div`
  padding: 2rem;
  height: 80vh;
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