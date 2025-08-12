import React, { useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Container, 
  Typography, 
  Paper,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CloudUpload, 
  CameraAlt, 
  PhotoLibrary,
  Favorite
} from '@mui/icons-material';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from '../components/LanguageSelector';
import PhotoUpload from '../components/PhotoUpload';
import CameraCapture from '../components/CameraCapture';
import Gallery from '../components/Gallery';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9f4 0%, #fefffe 100%);
`;

const HeaderSection = styled(Box)`
  background: linear-gradient(135deg, #339e5f 0%, #268049 100%);
  color: white;
  padding: 3rem 0 4rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hearts" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><text x="10" y="15" text-anchor="middle" fill="rgba(255,255,255,0.1)" font-size="12">♥</text></pattern></defs><rect width="100" height="100" fill="url(%23hearts)"/></svg>');
    opacity: 0.1;
  }
`;

const ContentContainer = styled(Container)`
  position: relative;
  z-index: 1;
`;

const WelcomeCard = styled(Paper)`
  margin-top: -2rem;
  border-radius: 20px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
`;

const StyledTabs = styled(Tabs)`
  .MuiTabs-flexContainer {
    justify-content: center;
    
    @media (max-width: 768px) {
      justify-content: flex-start;
    }
  }
  
  .MuiTab-root {
    min-width: 120px;
    padding: 1rem 1.5rem;
    
    @media (max-width: 768px) {
      min-width: 80px;
      padding: 0.75rem 1rem;
    }
  }
`;

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabIndex, setTabIndex] = useState(0);

  const tabs = [
    { 
      label: t('navigation.upload'), 
      icon: <CloudUpload />, 
      component: <PhotoUpload /> 
    },
    { 
      label: t('navigation.camera'), 
      icon: <CameraAlt />, 
      component: <CameraCapture /> 
    },
    { 
      label: t('navigation.gallery'), 
      icon: <PhotoLibrary />, 
      component: <Gallery /> 
    }
  ];

  return (
    <DashboardContainer>
      <HeaderSection>
        <ContentContainer maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 3
          }}>
            <Box>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Favorite sx={{ color: 'secondary.main' }} />
                {t('dashboard.title')}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 400
                }}
              >
                {t('dashboard.subtitle')}
              </Typography>
              {user && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 2,
                    opacity: 0.8,
                    fontStyle: 'italic'
                  }}
                >
                  {t('dashboard.welcomeBack')}, {user.name}!
                </Typography>
              )}
            </Box>
            <LanguageSelector variant="compact" />
          </Box>
        </ContentContainer>
      </HeaderSection>

      <ContentContainer maxWidth="lg">
        <Fade in timeout={600}>
          <WelcomeCard>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <StyledTabs 
                value={tabIndex} 
                onChange={(e, val) => setTabIndex(val)}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={index}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                    sx={{
                      '&.Mui-selected': {
                        color: 'primary.main',
                        fontWeight: 600
                      }
                    }}
                  />
                ))}
              </StyledTabs>
            </Box>
            
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Fade in key={tabIndex} timeout={400}>
                <Box>
                  {tabs[tabIndex].component}
                </Box>
              </Fade>
            </Box>
          </WelcomeCard>
        </Fade>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;