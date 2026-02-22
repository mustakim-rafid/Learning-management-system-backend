import multer from "multer";
import path from "path";
import fs from "fs"
import { v2 as cloudinary } from "cloudinary";
import getEnvs from "../config"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: Express.Multer.File) => {

  cloudinary.config({
    cloud_name: getEnvs.cloudinary.cloudinary_cloud_name,
    api_key: getEnvs.cloudinary.cloudinary_api_key,
    api_secret: getEnvs.cloudinary.cloudinary_api_secret,
  });

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: file.filename,
      resource_type: "auto"
    });

    if (result.secure_url) {
      fs.unlinkSync(file.path)
    }
    
    return result;
  } catch (error) {
    fs.unlinkSync(file.path)
    console.error(error);
  }
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
