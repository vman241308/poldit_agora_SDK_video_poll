import configs from "../../endpoints.config";
import UserLoc from "../../models/userLoc";
import IUserLoc from "../../models/interfaces/userMeta";
import { Types } from "mongoose";

export const storeGeoLocMetaData = async (userLoc: string, userId: string) => {
  const userLocData = JSON.parse(userLoc);
  const user = Types.ObjectId(userId);

  try {
    const existingUserLoc = await UserLoc.find({
      $and: [{ user }, { ip: userLocData.ip }],
    });

    if (existingUserLoc.length === 0) {
      const newLocData: IUserLoc = new UserLoc({
        ...userLocData,
        user,
      });

      await newLocData.save();
      return "userLoc added";
    }

    return "user loc already exists";
  } catch (err) {
    console.log(err);
  }
};
