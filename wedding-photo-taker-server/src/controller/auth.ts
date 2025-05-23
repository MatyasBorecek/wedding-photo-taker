import {Request, Response} from 'express';
import {AuthService} from '../service/auth.js';
import {ApiError} from '../error/api.js';
import {isAuthenticatedRequest} from "../helper/jwt.js";
import AuthenticatedRequest from "../interface/authenticated-request";

export class AuthController {
  private readonly _authService = new AuthService();

  registerDevice = async (req: Request, res: Response) => {
    const {deviceId, name} = req.body;

    if (!deviceId) {
      throw new ApiError('Device ID is required', 400);
    }

    const token = await this._authService.handleDevice(deviceId, name);
    res.json({token});
  }

  getCurrentUser = async (req: Request, res: Response) => {
    if (!await isAuthenticatedRequest(req)) {
      throw new ApiError('Invalid request obtained', 401);
    }
    const authReq = req as AuthenticatedRequest;
    const user = await this._authService.validateUser(authReq.user.id);
    res.json(user);
  }

  checkRegistration = async (req: Request, res: Response) => {
    try {
      if (!await isAuthenticatedRequest(req)) {
        throw new ApiError('Device not registered', 401);
      }

      const authReq = req as AuthenticatedRequest;
      const user = await this._authService.validateUser(authReq.user.id);
      res.json({
        registered: true,
        user: {
          id: user._id,
          name: user.name,
          role: user.role
        }
      });
    } catch (err) {
      res.json({registered: false});
    }
  }
}