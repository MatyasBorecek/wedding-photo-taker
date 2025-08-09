import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import {appConfig} from './config/index.js';
import {AuthController} from './controller/auth.js';
import {PhotoController} from './controller/photo.js';
import {LogController} from './controller/log.js';
import {authMiddleware, adminMiddleware} from './middleware/auth.js';
import {storageMiddleware} from './helper/storage.js';
import {errorHandler} from './middleware/error.js';

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: "http://localhost:3000", // Localhost
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization"
}));
app.use(cookieParser());
app.use(express.json());

// Serve static uploads folder with proper CORS settings
app.use("/uploads", express.static(path.join(appConfig.UPLOAD_DIR), {
  setHeaders: (res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

// Routes
const authController = new AuthController();
const photoController = new PhotoController();
const logController = new LogController();

app.post('/api/auth/register', authController.registerDevice);
app.get('/api/auth/me', authMiddleware, authController.getCurrentUser);
app.get('/api/auth/check-registration', authController.checkRegistration);

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

// Logging route - no auth required for logging
app.post('/api/logs', logController.receiveLogs);

// Error handling
app.use(errorHandler);

export default app;
