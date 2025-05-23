import { PhotoDAO } from '../dao/photo.js';
import { UserDAO } from '../dao/user.js';
import { ApiError } from '../error/api.js';
import { IPhoto } from '../model/photo.js';
import { Types } from 'mongoose';

export class PhotoService {
  private _photoDao = new PhotoDAO();
  private _userDao = new UserDAO();

  async uploadPhoto(userId: string, file: Express.Multer.File, isPublic: boolean): Promise<IPhoto> {
    const user = await this._userDao.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    return this._photoDao.create({
      fileName: file.filename,
      originalName: file.originalname,
      owner: new Types.ObjectId(userId),
      isPublic
    });
  }

  async getPhotos(userId: string) {
    // Fetch photos that are either owned by the user OR are public
    return this._photoDao.findAccessiblePhotos(userId);
  }

  async deletePhoto(photoId: string, userId: string) {
    return this._photoDao.deleteById(photoId, userId);
  }

  async updatePhoto(photoId: string, userId: string, isPublic: boolean) {
    const photo = await this._photoDao.updatePhoto(photoId, userId, isPublic);
    if (!photo) throw new ApiError('Photo not found', 404);
    return photo;
  }
}