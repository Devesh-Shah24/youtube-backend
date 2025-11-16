import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { handler } from "../utils/handler.js";

const healthcheck = handler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }, "Server is healthy")
  );
});

export { healthcheck };
