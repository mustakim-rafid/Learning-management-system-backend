import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  frontend_url: process.env.FRONTEND_URL,
  cloudinary: {
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
  jwt: {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    access_token_expiry: process.env.ACCESS_TOKEN_EXPIRY,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expiry: process.env.REFRESH_TOKEN_EXPIRY,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD
  },
};
