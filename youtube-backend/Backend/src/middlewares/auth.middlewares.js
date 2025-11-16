import { handler } from "../utils/handler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";


export const verifyJWT = handler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token) throw new ApiError("Unauthorized request", 401);
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!decodedToken?._id) throw new ApiError("Invalid token", 401);
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user) throw new ApiError("invalid access token", 404);
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(error.message || "Unauthorized request", 401);
  } 
  
})