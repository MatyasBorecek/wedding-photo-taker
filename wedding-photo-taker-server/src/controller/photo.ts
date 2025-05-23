import {Response, Request} from 'express';
import {PhotoService} from '../service/photo.js';
import {ApiError} from '../error/api.js';
import {isAuthenticatedRequest} from "../helper/jwt.js";
import AuthenticatedRequest from "../interface/authenticated-request";

export class PhotoController {
  private _photoService = new PhotoService();

  uploadPhoto = async (req: Request, res: Response) => {
    if (!await isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    const authReq = req as AuthenticatedRequest;
    if (!authReq.file) {
      throw new ApiError('No file uploaded', 400);
    }

    const photo = await this._photoService.uploadPhoto(
        authReq.user.id,
        authReq.file,
        authReq.body.isPublic === 'true'
    );

    res.status(201).json(photo);
  };

  listPhotos = async (req: Request, res: Response) => {
    if (!await isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    const authReq = req as AuthenticatedRequest;
    const photos = await this._photoService.getPhotos(authReq.user.id);
    res.json(photos);
  };

  deletePhoto = async (req: Request, res: Response) => {
    if (!await isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    const authReq = req as AuthenticatedRequest;
    const success = await this._photoService.deletePhoto(
        authReq.params.id,
        authReq.user.id
    );

    res.json({success});
  };

  updatePhoto = async (req: Request, res: Response) => {
    if (!await isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request', 401);
    }

    const authReq = req as AuthenticatedRequest;
    const photo = await this._photoService.updatePhoto(
        authReq.params.id,
        authReq.user.id,
        authReq.body.isPublic
    );

    res.json(photo);
  };
}

