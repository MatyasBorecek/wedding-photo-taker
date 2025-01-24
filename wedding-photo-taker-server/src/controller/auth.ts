import {Request, Response} from 'express';
import {AuthService} from '../service/auth.js';
import {ApiError} from '../error/api.js';
import {isAuthenticatedRequest} from "../helper/jwt.js";

export class AuthController {
  private _authService = new AuthService();

  async registerDevice(req: Request, res: Response) {
    const {deviceId, name} = req.body;

    if (!deviceId) {
      throw new ApiError('Device ID is required', 400);
    }

    const token = await this._authService.handleDevice(deviceId, name);
    res.json({token});
  }

  async getCurrentUser(req: Request, res: Response) {
    if (!isAuthenticatedRequest(req)) {
      return new ApiError('Invalid request obtained', 401);
    }

    const user = await this._authService.validateUser(req.user.id);
    res.json(user);
  }
}