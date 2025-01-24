import {Request} from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string, role: string };
}

export default AuthenticatedRequest;