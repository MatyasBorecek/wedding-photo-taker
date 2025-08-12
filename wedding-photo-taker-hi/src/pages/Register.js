import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Typography,
  Box, 
  Paper,
  Fade,
  Alert
 } from '@mui/material';
import { Camera, Star, VerifiedUser } from '@mui/icons-material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { registerDevice } from '../api/ApiHelper';
import Cookies from "js-cookie";

const StyledContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f4 0%, #dcf2e3 50%, #bce5cb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
`;

const WelcomeCard = styled(Paper)`
  max-width: 480px;
  width: 100%;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 24px !important;
  box-shadow: 0 20px 60px rgba(51, 158, 95, 0.15) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
`;

const IconContainer = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  
  .icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #339e5f 0%, #268049 100%);
    color: white;
    animation: float 3s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: -1s;
    }
    
    &:nth-child(3) {
      animation-delay: -2s;
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const LanguageSelectorContainer = styled(Box)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
`;

const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('auth.enterName'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await registerDevice(name);
      Cookies.set('token', data.token, { expires: 365 });
      navigate('/dashboard');
    } catch (err) {
      setError(err.userMessage || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer>
      <LanguageSelectorContainer>
        <LanguageSelector />
      </LanguageSelectorContainer>
      
      <Fade in timeout={800}>
        <WelcomeCard elevation={0}>
          <IconContainer>
            <Box className="icon">
              <Camera />
            </Box>
            <Box className="icon">
              <Star />
            </Box>
            <Box className="icon">
              <VerifiedUser />
            </Box>
          </IconContainer>
          
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              color: 'primary.main',
              fontWeight: 700,
              mb: 1
            }}
          >
            {t('auth.welcome')}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            {t('auth.welcomeMessage')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label={t('auth.yourName')}
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 3 }}
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600
              }}
            >
              {loading ? t('common.loading') : t('auth.joinCelebration')}
            </Button>
          </Box>
        </WelcomeCard>
      </Fade>
    </StyledContainer>
  );
};

export default Register;