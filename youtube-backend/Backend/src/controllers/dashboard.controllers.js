import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handler } from '../utils/handler.js';



const getChannelStats = handler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError("Invalid channel ID", 400);
  }

  // 1. Total videos
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // 2. Total views
  const totalViewsAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViews = totalViewsAgg[0]?.totalViews || 0;

  // 3. Total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId
  });

  // 4. Total likes
  const videoIds = await Video.find({ owner: channelId }).select("_id");
  const videoIdList = videoIds.map((v) => v._id);

  const totalLikesAgg = await Like.aggregate([
    { $match: { video: { $in: videoIdList } } },
    { $count: "totalLikes" },
  ]);
  const totalLikes = totalLikesAgg[0]?.totalLikes || 0;

  // 5. Total comments
  const totalComments = await Comment.countDocuments({
    video: { $in: videoIdList },
  });

  // 6. Recent 7 days views
  const last7DaysViewsAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $unwind: "$dailyViews" },
    {
      $match: {
        "dailyViews.date": {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    },
    { $group: { _id: null, views: { $sum: "$dailyViews.count" } } },
    { $sort: { _id: -1 } }
  ]);
  const last7DaysViews = last7DaysViewsAgg[0]?.views || 0;

  // 7. Most viewed video
  const topVideo = await Video.findOne({ owner: channelId })
    .sort({ views: -1 })
    .select("title views thumbnail")
    .lean();

  // 8. Avg views per video
  const avgViewsPerVideo = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;

  // // 9. Engagement rate
  // const engagementRate =
  //   totalViews > 0 ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2) : 0;

  // 10. Watchtime
  const watchtimeAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    {
      $group: {
        _id: null,
        watchtime: { $sum: { $multiply: ["$duration", "$views"] } },
      },
    },
  ]);
  const totalWatchtime = watchtimeAgg[0]?.watchtime || 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes,
        totalComments,
        last7DaysViews,
        topVideo,
        avgViewsPerVideo,
        // engagementRate,
        totalWatchtime,
      },
      "Channel stats fetched successfully"
    )
  );
});


const getChannelVideos = handler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError("Invalid channel ID", 400);
  }

  const videos = await Video.find({ owner: channelId })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 }); // latest videos first

  const totalVideos = await Video.countDocuments({ owner: channelId });

  res.status(200).json(
    new ApiResponse(200, {
      videos,
      pagination: {
        total: totalVideos,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalVideos / limit),
      },
    },
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
