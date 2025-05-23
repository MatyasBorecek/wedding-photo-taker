import jwt from "jsonwebtoken";
import {UserDAO} from '../dao/user.js';
import {appConfig} from '../config/index.js';
import {ApiError} from '../error/api.js';

export class AuthService {
  private _userDao = new UserDAO();

  async handleDevice(deviceId: string, name?: string) {
    const user = await this._userDao.findOrCreate(deviceId, name);
    return this.generateToken(user);
  }

  private generateToken(user: any) {
    return jwt.sign(
        {id: user._id, role: user.role},
        appConfig.JWT_SECRET,
        {expiresIn: '7d'}
    );
  }

  async validateUser(userId: string) {
    const user = await this._userDao.findById(userId);
    if (!user) throw new ApiError('User not found', 404);
    return user;
  }

  async checkRegistration(token: string) {
    try {
      const decoded = jwt.verify(token, appConfig.JWT_SECRET) as any;
      const user = await this._userDao.findById(decoded.id);
      return !!user;
    } catch (err) {
      return false;
    }
  }
}