import {sign} from "jsonwebtoken";
import {UserDAO} from '../dao/user';
import {config} from '../config';
import {ApiError} from '../error/api';

export class AuthService {
  private _userDao = new UserDAO();

  async handleDevice(deviceId: string, name?: string) {
    const user = await this._userDao.findOrCreate(deviceId, name);
    return this.generateToken(user);
  }

  private generateToken(user: any) {
    return sign(
        {id: user._id, role: user.role},
        config.JWT_SECRET,
        {expiresIn: '7d'}
    );
  }

  async validateUser(userId: string) {
    const user = await this._userDao.findById(userId);
    if (!user) throw new ApiError('User not found', 404);
    return user;
  }
}