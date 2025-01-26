import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import {appConfig} from './config/index.js';
import {AuthController} from './controller/auth.js';
import {PhotoController} from './controller/photo.js';
import {authMiddleware, adminMiddleware} from './middleware/auth.js';
import {storageMiddleware} from './helper/storage.js';
import {errorHandler} from './middleware/error.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(appConfig.UPLOAD_DIR));

// Routes
const authController = new AuthController();
const photoController = new PhotoController();

app.post('/api/auth/register', authController.registerDevice);
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);

app.post('/api/photos',
    authMiddleware,
    storageMiddleware,
    photoController.uploadPhoto
);

app.get('/api/photos', authMiddleware, photoController.listPhotos);
app.delete('/api/photos/:id', authMiddleware, photoController.deletePhoto);
app.patch('/api/photos/:id', authMiddleware, photoController.updatePhoto);

// Admin routes
app.get('/api/admin/photos', authMiddleware, adminMiddleware, photoController.listPhotos);
app.patch('/api/admin/photos/:id', authMiddleware, adminMiddleware, photoController.updatePhoto);

// Error handling
app.use(errorHandler);

export default app;