import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import styled from 'styled-components';
import PhotoUpload from '../components/PhotoUpload';
import CameraCapture from '../components/CameraCapture';
import Gallery from '../components/Gallery';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Dashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <DashboardContainer>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)}>
          <Tab label="Upload Photos"/>
          <Tab label="Take Photo"/>
          <Tab label="View Gallery"/>
        </Tabs>
      </Box>
      <Box sx={{ pt: 3 }}>
        {tabIndex === 0 && <PhotoUpload/>}
        {tabIndex === 1 && <CameraCapture/>}
        {tabIndex === 2 && <Gallery/>}
      </Box>
    </DashboardContainer>
  );
};

export default Dashboard;