import {Types, model, Document, Schema} from 'mongoose';

export interface IPhoto extends Document {
  fileName: string;
  originalName: string;
  owner: Types.ObjectId | String;
  isPublic: boolean;
  createdAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  fileName: {type: String, required: true},
  originalName: {type: String, required: true},
  owner: {type: Types.ObjectId, ref: 'User', required: true},
  isPublic: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now}
});

PhotoSchema.index({owner: 1, isPublic: 1});

export const Photo = model<IPhoto>('Photo', PhotoSchema);