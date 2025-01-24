import {Photo, IPhoto} from '../model/photo.js';

export class PhotoDAO {
  async create(photoData: Partial<IPhoto>): Promise<IPhoto> {
    const photo = new Photo(photoData);
    return photo.save();
  }

  async findByOwner(ownerId: string): Promise<IPhoto[]> {
    return Photo.find({owner: ownerId});
  }

  async findPublicPhotos(): Promise<IPhoto[]> {
    return Photo.find({isPublic: true});
  }

  async deleteById(photoId: string, ownerId: string): Promise<boolean> {
    const result = await Photo.deleteOne({_id: photoId, owner: ownerId});
    return result.deletedCount > 0;
  }
}