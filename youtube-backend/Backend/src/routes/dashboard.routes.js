import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controllers.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();

router.use(verifyJWT);

router.route("/:channelId/stats").get(getChannelStats);
router.route("/:channelId/videos").get(getChannelVideos);

export default router