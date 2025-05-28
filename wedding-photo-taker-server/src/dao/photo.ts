import {Photo, IPhoto} from '../model/photo.js';
import mongoose from "mongoose";

export class PhotoDAO {
  async create(photoData: Partial<IPhoto>): Promise<IPhoto> {
    const formattedData = {
      ...photoData,
      owner:
          typeof photoData.owner === 'string'
              ? new mongoose.Types.ObjectId(photoData.owner)
              : photoData.owner
    };

    const photo = new Photo(formattedData);
    return photo.save();
  }

  async findAccessiblePhotos(userId: string): Promise<IPhoto[]> {
    return Photo.find({
      $or: [
        {owner: userId},
        {isPublic: true}
      ]
    }).populate('owner', 'name')
    .sort({createdAt: -1});
  }

  async deleteById(photoId: string, ownerId: string): Promise<boolean> {
    const result = await Photo.deleteOne({_id: photoId, owner: ownerId});
    return result.deletedCount > 0;
  }

  async updatePhoto(photoId: string, ownerId: string, isPublic: boolean): Promise<IPhoto | null> {
    return Photo.findOneAndUpdate(
        {_id: photoId, owner: ownerId},
        {$set: {isPublic}},
        {new: true}
    ).populate('owner', 'name');
  }
}