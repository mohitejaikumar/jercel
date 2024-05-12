import { NextFunction, Response } from "express";
import CustomRequest from "../customInterface/customRequest";
import jwt from "jsonwebtoken";

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader);
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified: any = jwt.verify(token, process.env.JWT_SECRET as string);
    req.userId = verified.userId;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid token" });
  }
};

export default verifyToken;
