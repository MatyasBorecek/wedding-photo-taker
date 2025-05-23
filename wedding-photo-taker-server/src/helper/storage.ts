import multer from "multer";
import {appConfig} from '../config/index.js';
import {v4} from 'uuid';

const storage = multer.diskStorage({
  destination: appConfig.UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${v4()}.${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: {fileSize: parseInt(appConfig.MAX_FILE_SIZE)}
});

export const storageMiddleware = upload.single('photo');