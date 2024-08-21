// import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
const JwtKey = process.env.NEXT_PUBLIC_JWT_KEY ?? "";

export const isTokkenValid = (token: string) => {
  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwt.verify(token, JwtKey);
    return true;
  } catch (err) {
    return false;
  }
};
