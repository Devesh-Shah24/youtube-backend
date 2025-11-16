import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handler } from "../utils/handler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// Get all videos with query, sorting, and pagination
const getAllVideos = handler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }
  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const videos = await Video.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("owner", "username avatar");

  const total = await Video.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { total, page, limit, videos },
        "Videos fetched successfully"
      )
    );
});

// Publish a video
const publishAVideo = handler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath) throw new ApiError(400, "Video file is required");

  const videoUpload = await uploadToCloudinary(videoFilePath);

  const thumbnailUpload = thumbnailPath
    ? await uploadToCloudinary(thumbnailPath)
    : null;

  if (!videoUpload?.url) throw new ApiError(500, "Video upload failed");

  const video = await Video.create({
    title,
    description,
    videoFile: videoUpload.url,
    videoFilePublicId: videoUpload.public_id,
    thumbnail: thumbnailUpload?.url || "",
    thumbnailPublicId: thumbnailUpload?.public_id || "",
    owner: req.user._id,
    duration: videoUpload.duration || 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

// Get video by ID
const getVideoById = handler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
 // increment total views + dailyViews
  await Video.updateOne(
    { _id: videoId, "dailyViews.date": todayDate },
    {
      $inc: { views: 1, "dailyViews.$.count": 1 },
    }
  );

  // if today entry not exist, push new date object
  await Video.updateOne(
    { _id: videoId, "dailyViews.date": { $ne: todayDate } },
    {
      $inc: { views: 1 },
      $push: { dailyViews: { date: todayDate, count: 1 } },
    }
  );

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { views: 1 },
    },
    { new: true }
  ).populate("owner", "username avatar fullName email");

  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

//  Update video details
const updateVideo = handler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  // Update thumbnail if new file is uploaded
  if (req.file?.path) {
    // Delete old thumbnail from Cloudinary
    if (video.thumbnailPublicId) {
      await deleteFromCloudinary(video.thumbnailPublicId, "image");
    }

    // Upload new thumbnail
    const thumbnailUpload = await uploadToCloudinary(req.file.path);
    if (!thumbnailUpload?.url)
      throw new ApiError(500, "Thumbnail upload failed");

    // Update DB
    video.thumbnail = thumbnailUpload.url;
    video.thumbnailPublicId = thumbnailUpload.public_id;
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

// Delete a video
const deleteVideo = handler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Delete video file from Cloudinary
  if (video.videoFilePublicId) {
    await deleteFromCloudinary(video.videoFilePublicId, "video");
  }

  // Delete thumbnail from Cloudinary if exists
  if (video.thumbnailPublicId) {
    await deleteFromCloudinary(video.thumbnailPublicId, "image");
  }

  // Delete the document from MongoDB
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// Toggle publish/unpublish status
const togglePublishStatus = handler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
