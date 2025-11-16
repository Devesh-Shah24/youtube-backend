// import { Router } from "express";
// import {
//     getSubscribedChannels,      // subscriber → channels
//     getUserChannelSubscribers,  // channel → subscribers
//     toggleSubscription,         // subscribe/unsubscribe
//     getSubscribedInfo,           // subscribed info
//     getMySubscribers,
// } from "../controllers/subscription.controllers.js";
// import { verifyJWT } from "../middlewares/auth.middlewares.js";

// const router = Router();
// router.use(verifyJWT);

// // Toggle subscription (log-in user subscribes/unsubscribes a channel)
// router.route("/c/:channelId").post(toggleSubscription);

// // Get all channels a user has subscribed to
// router.route("/user/:subscriberId").get(getSubscribedChannels);
// router.route("/").get(getMySubscribers);
// // Get all subscribers of a channel
// router.route("/channel/:channelId").get( getUserChannelSubscribers);

// // Get logged-in user subscription info
// router.route("/info").get( getSubscribedInfo);

// // Get subscription info for a specific userId
// router.route("/info/:userId").get( getSubscribedInfo);

// export default router;



import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getUserSubscriptions,
  getMySubscriptionInfo,
  getMySubscribers
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const router = Router();

router.use(verifyJWT);

// Subscribe / unsubscribe
router.post("/c/:channelId", toggleSubscription);

// Subscribers of a specific channel
router.get("/channel/:channelId", getChannelSubscribers);

// Channels a user has subscribed to
router.get("/user", getUserSubscriptions);//logged-in user     
router.get("/user/:userId", getUserSubscriptions); //any user

// Logged-in user's subscription info
router.get("/info", getMySubscriptionInfo);

// Logged-in user's subscribers
router.get("/my-subscribers", getMySubscribers);

export default router;
