import { model, Schema, models } from "mongoose";
import IUser from "./interfaces/user";

const notificationSchema = new Schema({
  message: {
    type: String,
    required: false,
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  collectionType: {
    type: String,
    required: true,
  },
  collectionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  parentCollectionId: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  read: { type: Boolean, required: false },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const areasInterest = new Schema({
  topicId: {
    type: Schema.Types.ObjectId,
    ref: "Topic",
  },
  topic: { type: String },
  subtopic: { type: String },
  subtopicId: {
    type: Schema.Types.ObjectId,
    ref: "SubTopic",
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const userSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  appid: {
    type: String,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  address1: {
    type: String,
    required: false,
  },
  address2: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  zipcode: {
    type: String,
    required: false,
  },
  newUser: { type: Boolean, required: false },
  loginMethod: { type: String, required: false },
  birthday: {
    type: String,
    required: false,
  },
  status: { type: String, required: false },
  profilePic: {
    type: String,
    required: false,
  },
  useragreementagreed: {
    type: Boolean,
    require: true,
  },
  registerDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  bio: { type: String, required: false },
  following: [
    {
      appId: { type: String },
      profilePic: { type: String },
    },
  ],
  pollHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Poll",
    },
  ],
  favorites: [
    {
      favoriteType: { type: String, enum: ["Poll", "Answer"] },
      favoriteId: {
        type: Schema.Types.ObjectId,
        refPath: "favoriteType",
      },
    },
  ],
  notifications: [notificationSchema],
  areasOfInterest: [areasInterest],
  topicsOfInterest: [
    {
      topicId: {
        type: Schema.Types.ObjectId,
        ref: "Topic",
      },
      creationDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },

  isEmailVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  areasOfKnowledge: [
    {
      upVotes: [
        {
          userId: {
            type: String,
          },
        },
      ],
      downVotes: [
        {
          userId: {
            type: String,
          },
        },
      ],

      areaKnowledgeId: {
        type: Schema.Types.ObjectId,
        refPath: "AreaKnowledge",
      },
      isActive: { type: Boolean, required: false, default: false },
    },
  ],
});

export default models.User || model<IUser>("User", userSchema);
// module.exports = mongoose.models.User || mongoose.model("User", userSchema);
