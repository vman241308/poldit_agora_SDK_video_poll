import { Request, Response } from "express-serve-static-core";

const cloudinary = require("cloudinary").v2;

export default async (req: Request, res: Response) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const { folder, public_id } = req.body;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      public_id,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.statusCode = 200;
  res.json({ signature, timestamp });
};
