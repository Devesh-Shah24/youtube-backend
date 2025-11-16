import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handler } from "../utils/handler.js";


const getVideoComments = handler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid video ID", 400);
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username email") // only return necessary fields
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const totalComments = await Comment.countDocuments({ video: videoId });

  res.status(200).json(
    new ApiResponse(200, {
      comments,
      pagination: {
        total: totalComments,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalComments / limit),
      },
    }, "Comments fetched successfully")
  );
});

const addComment = handler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError("Invalid video ID", 400);
  }

  if (!content?.trim()) {
    throw new ApiError("Content is required", 400);
  }

  const newComment = await Comment.create({
    video: videoId,
    content: content.trim(),
    owner: userId,
  });

  res
    .status(201)
    .json(new ApiResponse(200, { comment: newComment }, "Comment added successfully"));
});

const updateComment = handler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError("Invalid comment ID", 400);

  if (!content?.trim()) throw new ApiError("Content cannot be empty", 400);

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found", 404);

  if (!comment.owner || comment.owner.toString() !== userId.toString()) {
    throw new ApiError("You are not authorized to update this comment", 403);
  }

  comment.content = content.trim();
  await comment.save();

  res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment updated successfully"));
});


const deleteComment = handler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) throw new ApiError("Invalid comment ID", 400);

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError("Comment not found", 404);

  if (!comment.owner || comment.owner.toString() !== userId.toString()) throw new ApiError("You are not authorized to delete this comment", 403);

  await Comment.deleteOne({ _id: commentId });

  res
    .status(200)
    .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});


export { getVideoComments, addComment, updateComment, deleteComment };

