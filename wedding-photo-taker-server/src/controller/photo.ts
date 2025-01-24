import {Response, Request} from 'express';
import {PhotoService} from '../service/photo.js';
import {ApiError} from '../error/api.js';
import {isAuthenticatedRequest} from "../helper/jwt.js";


export class PhotoController {
  private _photoService = new PhotoService();

  async uploadPhoto(req: Request, res: Response) {
    if (!isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    if (!req.file) {
      throw new ApiError('No file uploaded', 400);
    }

    const photo = await this._photoService.uploadPhoto(
        req.user.id,
        req.file,
        req.body.isPublic === 'true'
    );

    res.status(201).json(photo);
  }

  async listPhotos(req: Request, res: Response) {
    if (!isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    const photos = await this._photoService.getPhotos(req.user.id);
    res.json(photos);
  }

  async deletePhoto(req: Request, res: Response) {
    if (!isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    const success = await this._photoService.deletePhoto(
        req.params.id,
        req.user.id
    );

    res.json({success});
  }
}
