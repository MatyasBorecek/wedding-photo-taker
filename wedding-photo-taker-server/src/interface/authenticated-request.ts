import {Request} from "express";

interface AuthenticatedRequest extends Request {
  user: { id: string, role: "user" | "admin" };
}

export default AuthenticatedRequest;