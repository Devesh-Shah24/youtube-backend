import { handler } from '../utils/handler.js';
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



// generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }catch(error){
    throw new ApiError("Failed to generate tokens", 500);
  }
};

//register user
const registerUser = handler(async (req, res, next) => {
  // res.status(200).json({
  //   message: "ok"
  // })

  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return next(new ApiError("All fields are required", 400));
  }
  // if(
  //   [fullName, username, email, password].some((field) => field.trim() === "")
  // ){
  //   throw new Apierror("Fields cannot be empty", 400);
  // }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }]})
  if(existedUser){
    throw new ApiError("User already exists", 409)
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // let coverImageLocalPath;
  // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }

  // if(!avatarLocalPath){
  //   throw new ApiError("Avatar is required", 400)
  // }

  // const avatar = await uploadToCloudinary(avatarLocalPath);
  // const coverImage = await uploadToCloudinary(coverImageLocalPath);
  // if(!avatar){
  //   throw new ApiError("Failed to upload avatar", 400)
  // }

  const avatarLocalPath =
    req.files?.avatar && Array.isArray(req.files.avatar) && req.files.avatar.length > 0
      ? req.files.avatar[0].path
      : undefined;

  const coverImageLocalPath =
    req.files?.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0
      ? req.files.coverImage[0].path
      : undefined;

  if (!avatarLocalPath) {
    throw new ApiError("Avatar is required", 400);
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError("Failed to upload avatar", 400);
  }

  const user = await User.create({
    fullName,
    avatar: {
    url: avatar.secure_url || avatar.url,        
    public_id: avatar.public_id                  
  },
    coverImage: coverImage ? { 
    url: coverImage.secure_url || coverImage.url,
    public_id: coverImage.public_id
  } : {},
    username: username.toLowerCase(),
    email,
    password
  })

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
  if(!createUser){
    throw new ApiError("Failed to create user", 500)
  }

  return res.status(201).json(
    new ApiResponse(200, createUser, "User created successfully")
  )

});

// login user
const loginUser = handler(async (req, res, next) => {
  const { email, username, password } = req.body;
  if(!email && !username){
    throw new ApiError("fields are required", 400);
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  })
  if(!user){
    throw new ApiError("Invalid user", 401);
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError("Invalid user password", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loogedInUser = await User.findById(user._id).select("-password -refreshToken")
  if(!loogedInUser){
    throw new ApiError("Failed to login user", 500);
  }

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(
    new ApiResponse(
      200, 
      {
        user: loogedInUser,
        accessToken,
        refreshToken
      },
      "User logged in successfully"
    )
  );
})

//logout user
const logoutUser = handler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken: 1
      }
    },
    {
      new: true 
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("refreshToken", options)
  .clearCookie("accessToken", options)
  .json(
    new ApiResponse(
      200, 
      {},
      "User logged out successfully"
    )
  );

})

// refresh access token
const refreshAccessToken = handler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401, "invalid refresh token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "token expire")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
  
    return res
    .status(200)
    .cookie("refreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed successfully"
      )
    );
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request");
  }

})

// change current password
const changeCurrentPassword = handler(async (req, res, next) => {
  const {oldPassword, newPassword} = req.body
  const user = await User.findById(req.user?._id)
  if (!user) throw new ApiError(401, "User not found");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect){
    throw new ApiError(401, "invalid password")
  }
  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"password changed sucessfully"))
})

//update user avatar
const updateUserAvatar = handler(async (req, res, next) => {
  const avatarLocalPath = req.file?.path
  if(!avatarLocalPath) throw new ApiError(400, "avatar file missing")
    
    // find current user
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "user not found");
    
    // delete old avatar if exists
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
  }

  // upload new avatar
  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar) throw new ApiError(400, "error uploading avatar");

  user.avatar = { url: avatar.url, public_id: avatar.public_id };
  await user.save({ validateBeforeSave: false });

  // const user = await User.findByIdAndUpdate(
  //   req.user?._id,
  //   {
  //     $set: {
  //       avatar: avatar.url
  //     }
  //   },
  //   {next: true}
  // ).select("-password")

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "avatar updated successfully")
  )
})

//update user coverImage
const updateUserCoverImage = handler(async (req, res, next) => {
  const coverImageLocalPath = req.file?.path
  if(!coverImageLocalPath) throw new ApiError(400, "coverImage file missing")

  // find current user
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "user not found");

  // delete old coverImage if exists
  if (user.coverImage?.public_id) {
    await deleteFromCloudinary(user.coverImage.public_id);
  }

  // upload new coverImage
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!coverImage) throw new ApiError(400, "error uploading coverImage");

  user.coverImage = { url: coverImage.url, public_id: coverImage.public_id };
  await user.save({ validateBeforeSave: false });

  // const user = await User.findByIdAndUpdate(
  //   req.user?._id,
  //   {
  //     $set: {
  //       coverImage: coverImage.url
  //     }
  //   },
  //   {next: true}
  // ).select("-password");

  return res
  .status(200)
  .json(
    new ApiResponse(200, user, "coverImage updated successfully")
  )
})

//update user details
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

//get current user login
// const getCurrentUser = handler(async (req, res, next) => {
//   if (!req.user?._id) {
//     throw new ApiError(401, "Unauthorized");
//   }

//   const user = await User.findById(req.user._id)
//     .select("-password -refreshToken") // hide sensitive info
//     // .populate("watchHistory");        // populate referenced fields if any

//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Current user fetched successfully"));
// })
const getCurrentUser = handler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

//get user channel profile
const getUserChannelProfile = handler(async (req, res, next) => {
  const {username} = req.params

  if(!username?.trim()) throw new ApiError(400, "username messing")
  
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1
      }
    }
  ])
  if(!channel?.length) throw new ApiError(404, "channel does not exists")
  
  return res
  .status(200)
  .json(
    new ApiResponse(200, channel[0], "user channel fetched successfully")
  )
})

const getUserWatchHistory = handler(async (req, res, next) => {
  const user = await User.aggregate([{
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [{
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [{
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                },
                {
                  $addFields: {
                    owner: {
                      $first: "$owner"
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ])

  return res
  .status(200)
  .json(new ApiResponse(200, user[0].watchHistory, "User watch history fetched successfully"));
})









export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory
};