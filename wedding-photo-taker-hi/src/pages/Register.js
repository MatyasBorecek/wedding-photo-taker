import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import styled from 'styled-components';
import { registerDevice } from '../api/ApiHelper';
import Cookies from "js-cookie";

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding-top: 2rem;
`;

const Register = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await registerDevice(name);
      Cookies.set('token', { expires: 365 });
      navigate('/dashboard');
    } catch (err) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <StyledContainer maxWidth="xs">
      <Typography variant="h4" gutterBottom>
        Welcome to Our Wedding!
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Your Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 2 }}
        >
          Continue
        </Button>
      </Box>
    </StyledContainer>
  );
};

export default Register;