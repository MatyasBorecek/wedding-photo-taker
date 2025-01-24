import {Schema, model, Document} from 'mongoose';

export interface IPhoto extends Document {
  fileName: string;
  originalName: string;
  owner: Schema.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  fileName: {type: String, required: true},
  originalName: {type: String, required: true},
  owner: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  isPublic: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now}
});

PhotoSchema.index({owner: 1, isPublic: 1});

export const Photo = model<IPhoto>('Photo', PhotoSchema);