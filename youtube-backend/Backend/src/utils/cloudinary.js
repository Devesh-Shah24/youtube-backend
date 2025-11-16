import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises"; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload function
const uploadToCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete local temp file after upload
    await fs.unlink(localFilePath);
    
    return {
      url: response.secure_url,
      public_id: response.public_id
    };
  } catch (error) {
    // Delete local file if upload fails
    await fs.unlink(localFilePath);
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

// Delete function
const deleteFromCloudinary = async (public_id, resourceType = "image") => {
  if (!public_id) return null;
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });
    console.log(`Deleted from Cloudinary (${resourceType}):`, result);
    return result;
  } catch (err) {
    console.error(`Cloudinary delete error (${resourceType}):`, err);
    return null;
  }
};


export { uploadToCloudinary, deleteFromCloudinary };
