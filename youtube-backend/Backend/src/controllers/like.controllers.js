import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handler } from "../utils/handler.js";

// Toggle like on video
const toggleVideoLike = handler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const existingLike = await Like.findOne({
      video: videoId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);

      return res.status(200).json(new ApiResponse(200, null, "Video unliked"));
    } else {
      const newLike = await Like.create({
        video: videoId,
        likedBy: userId,
      });

      return res.status(201).json(new ApiResponse(201, newLike, "Video liked"));
    }
  } catch (error) {
    throw new ApiError(500, error.message || "somthing is went wrong");
  }
});

// Toggle like on comment
const toggleCommentLike = handler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(commentId))
      throw new ApiError(400, "Invalid comment ID");

    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment unliked"));
    } else {
      const newLike = await Like.create({
        comment: commentId,
        likedBy: userId,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, newLike, "Comment liked"));
    }
  } catch (error) {
    throw new ApiError(500, error.message || "somthing is went wrong");
  }
});

// Toggle like on tweet
const toggleTweetLike = handler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweet ID");

    const existingLike = await Like.findOne({
      tweet: tweetId,
      likedBy: userId,
    });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);

      return res.status(201).json(new ApiResponse(201, null, "Tweet unliked"));
    } else {
      const newLike = await Like.create({
        tweet: tweetId,
        likedBy: userId,
      });

      return res.status(200).json(new ApiResponse(200, newLike, "Tweet liked"));
    }
  } catch (error) {
    throw new ApiError(500, error.message || "somthing went wrong")
  }
});

//Get all liked videos by logged-in user
const getLikedVideos = handler(async (req, res) => {
  const userId = req.user?._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  })
    .populate("video", "title thumbnail views duration")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

//Get all liked comments by logged-in user
const getLikedComments = handler(async (req, res) => {
  const userId = req.user?._id;

  const likedComment = await Like.find({
    likedBy: userId,
    comment: { $exists: true },
  })
    .populate("comment", "content video owner")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedComment, "Liked comments fetched successfully")
    );
});

//Get all liked videos by logged-in user
const getLikedTweets = handler(async (req, res) => {
  const userId = req.user?._id;

  const likedTweets = await Like.find({
    likedBy: userId,
    tweet: { $exists: true },
  })
    .populate("tweet", "content owner")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedTweets, "Liked tweets fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos, getLikedComments,
getLikedTweets
};
