import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkDeviceRegistration } from '../api/ApiHelper';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if device is already registered
        const { data } = await checkDeviceRegistration();
        if (data.registered) {
          navigate('/dashboard');
        } else {
          navigate('/register');
        }
      } catch (err) {
        navigate('/register');
      }
    };

    checkAuth();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default Home;