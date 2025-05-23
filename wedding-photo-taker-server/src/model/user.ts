import {Schema, model, Document} from 'mongoose';

export interface IUser extends Document {
  name: string;
  deviceId: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {type: String, required: true},
  deviceId: {type: String, required: true, unique: true},
  role: {type: String, enum: ['user', 'admin'], default: 'user'},
  createdAt: {type: Date, default: Date.now}
});

UserSchema.index({deviceId: 1});

export const User = model<IUser>('User', UserSchema);