import mongoose from 'mongoose';
import {appConfig} from './config/index.js';
import app from './app.js';

const startServer = async () => {
  try {
    await mongoose.connect(appConfig.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(appConfig.PORT, () => {
      console.log(`Server running on port ${appConfig.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().then(r => {
  console.log(r);

});