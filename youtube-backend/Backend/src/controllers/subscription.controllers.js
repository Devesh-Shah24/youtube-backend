import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { handler } from "../utils/handler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//login user subscribe/unsubscribe channel
export const toggleSubscription = handler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  if (channelId.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingSub = await Subscription.findOne({ channel: channelId, subscriber: userId });

  if (existingSub) {
    await Subscription.findByIdAndDelete(existingSub._id);
    return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }

  const newSub = await Subscription.create({ channel: channelId, subscriber: userId });
  return res.status(201).json(new ApiResponse(201, newSub, "Subscribed successfully"));
});

// Get subscribers of a channel (channelId from params)
export const getChannelSubscribers = handler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username email _id avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      totalSubscribers: subscribers.length,
      subscribers,
    }, "Channel subscribers fetched")
  );
});

//channels the user has subscribed to
export const getUserSubscriptions = handler(async (req, res) => {
  const userId = req.params.userId || req.user._id;

  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const subscriptions = await Subscription.find({ subscriber: userId })
    .populate("channel", "username email _id avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      totalSubscriptions: subscriptions.length,
      subscriptions,
    }, "User subscriptions fetched successfully")
  );
});

//logged-in user info subscribed channels
export const getMySubscriptionInfo = handler(async (req, res) => {
  const userId = req.user._id;

  const subscriptions = await Subscription.find({ subscriber: userId })
    .populate("channel", "username email _id avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      totalSubscriptions: subscriptions.length,
      subscriptions,
    }, "Logged-in user subscription info fetched")
  );
});

//logged-in user's subscribers (who subscribes to me)
export const getMySubscribers = handler(async (req, res) => {
  const userId = req.user._id;

  const subscribers = await Subscription.find({ channel: userId })
    .populate("subscriber", "username email _id avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      totalSubscribers: subscribers.length,
      subscribers,
    }, "Fetched all subscribers for logged-in user")
  );
});
