import {User, IUser} from '../model/user.js';

export class UserDAO {
  async findOrCreate(deviceId: string, name?: string): Promise<IUser> {
    let user = await User.findOne({deviceId});

    if (!user) {
      user = new User({
        deviceId,
        name: name || `Guest-${Date.now()}`,
        role: 'user'
      });
      await user.save();
    }

    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }
}