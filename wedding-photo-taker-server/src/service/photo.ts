import {PhotoDAO} from '../dao/photo.js';
import {UserDAO} from '../dao/user.js';
import {ApiError} from '../error/api.js';
import {IPhoto} from '../model/photo.js';
import {Schema} from 'mongoose';

export class PhotoService {
  private _photoDao = new PhotoDAO();
  private _userDao = new UserDAO();

  async uploadPhoto(userId: string, file: Express.Multer.File, isPublic: boolean): Promise<IPhoto> {
    const user = await this._userDao.findById(userId);
    if (!user) throw new ApiError('User not found', 404);

    return this._photoDao.create({
      fileName: file.filename,
      originalName: file.originalname,
      owner: new Schema.Types.ObjectId(userId),
      isPublic
    });
  }

  async getPhotos(userId: string) {
    const [userPhotos, publicPhotos] = await Promise.all([
      this._photoDao.findByOwner(userId),
      this._photoDao.findPublicPhotos()
    ]);

    return [...userPhotos, ...publicPhotos];
  }

  async deletePhoto(photoId: string, userId: string) {
    return this._photoDao.deleteById(photoId, userId);
  }
}