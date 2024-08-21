import { VscCommentDiscussion } from "react-icons/vsc";
import { ImListNumbered } from "react-icons/im";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { RiChatCheckLine } from "react-icons/ri";

export const pillarData = [
  {
    action: "Ask",
    description:
      "Have questions but don’t want to dig through endless search engine results? Frustrated at trying to figure out where comments end and answers begin on other sites? Poldit let’s you easily find the answers you’re looking for while keeping the discussion separate to save time and headaches.",
    icon: BsFillQuestionCircleFill,
  },
  {
    action: "Answer",
    description:
      "Put your vast knowledge to use and help people by answering their questions. People trust other people. We want to create the singular resource for getting answers to your questions by compiling all outside resources in one place.",
    icon: RiChatCheckLine,
  },
  {
    action: "Rank",
    description:
      "People feel confident when they see experts, influencers, and every day people alike review and agree/disagree on something. Crowdsourced reviews and feedback organically help people make informed decisions. The cream rises to the top, and the bigger we grow, the more helpful this will be!",
    icon: ImListNumbered,
  },
  {
    action: "Discuss",
    description:
      "Sometimes answers aren’t enough, and static comments and replies don’t give you the clarity you need. Have a live discussion with users in real time to get deeper insights and connect with your peers through chat.",

    icon: VscCommentDiscussion,
  },
];

export const currentFeaturesData = [
  {
    area: "Navigation",
    isOpen: false,
    features: [
      {
        description: "Site and email notifications",
        isOpen: false,
        bullets: [
          "People answer questions on your polls",
          "Someone starts chatting on your polls",
          "Somone likes/dislikes your answers",
          "Someone restarts the conversation in a chat you participated in",
          "Someone references one of your answers in the chat",
          "Someone tags you in the chat",
          "People you're following create polls",
        ],
      },
      {
        description: "Search keywords, questions, answers and users",
        isOpen: false,
        bullets: [],
      },
      {
        description:
          "User Window",
        isOpen: false,
        bullets: [
          "See active users that you are following and which polls they are in",
          "See all users and the polls they are in",
        ],
      },
    ],
  },
  {
    area: "Home Page",
    isOpen: false,
    features: [
      {
        description: "Filter the home page",
        isOpen: false,
        bullets: [
          "Active Chats (descending by most recent chat messages)",
          "Trending Polls (descending by most overall activity)",
          "Newest Polls (descending by most recently created polls)",
        ],
      },
      {
        description: "See poll metrics",
        isOpen: false,
        bullets: [],
      },
      {
        description: "Favorite polls you want to save",
        isOpen: false,
        bullets: [],
      },
      {
        description: "See all the main topics currently available",
        isOpen: false,
        bullets: [
          "When you click a topic, it will take you to the All Topics page",
        ],
      },
    ],
  },
  {
    area: "Creating Polls",
    isOpen: false,
    features: [
      {
        description: "Create 2 different types of polls",
        isOpen: false,
        bullets: [
          "Open-ended polls where users provide the answers",
          "Multiple choice polls where you create the answers for other users to choose from",
        ],
      },
      {
        description: "Add new subtopics if yours isn’t listed",
        isOpen: false,
        bullets: [],
      },
    ],
  },
  {
    area: "Poll Pages",
    isOpen: false,
    features: [
      {
        description: "Open Ended Polls",
        isOpen: false,
        bullets: [
          "Create your own answers",
          "Like/dislike others answers to help rank them.  You can like and dislike more than 1 answer",
          "See the rankings change in real time",
          "Sort answers by various criteria: rank, newest answers, oldest answers, most liked, most disliked",
          "Reference answers in the chat",
        ],
      },
      {
        description: "Multiple choice answers",
        isOpen: false,
        bullets: [
          "Select the best answer to help show which is most popular/unpopular",
          "See ranking changes in real time",
        ],
      },
      {
        description: "Chat with other users on each poll",
        isOpen: false,
        bullets: [],
      },
      {
        description:
          "Tag other users who are chatting within the poll in the chat",
        isOpen: false,
        bullets: [],
      },
      {
        description: "See who is chatting on the User List",
        isOpen: false,
        bullets: [],
      },
      {
        description: "Follow users shown on the User List",
        isOpen: false,
        bullets: [],
      },
      {
        description: "Favorite Polls",
        isOpen: false,
        bullets: [],
      },
      {
        description:
          "Flag inappropriate questions, answers, and chat messages for admin review",
        isOpen: false,
        bullets: [],
      },
    ],
  },
  {
    area: "All Topics Page",
    isOpen: false,
    features: [
      {
        description: "Add Topics and Subtopics you want to see",
        isOpen: false,
        bullets: [],
      },
      {
        description:
          "View polls sorted by topics and/or subtopics when you click on the buttons",
        isOpen: false,
        bullets: [],
      },
      {
        description:
          "See how many polls have been created for each topic and subtopic (the number shown next to each button)",
        isOpen: false,
        bullets: [],
      },
    ],
  },
  {
    area: "Profile",
    isOpen: false,
    features: [
      {
        description: "Your profile",
        isOpen: false,
        bullets: [
          "See polls you created, favorited, and engaged with on your profile page",
          "Showcase your areas of knowledge and information about yourself for credibility",
          "See which users you are following and who is following you",
        ],
      },
      {
        description: "Other user profiles",
        isOpen: false,
        bullets: [
          "See which polls they created and engaged with",
          "See their areas of knowledge and information",
          "See who they are following and who is following them",
          "Follow/unfollow users",
        ],
      },
    ],
  },
];

export const upcomingFeatureData = [
  "Adding customizable filter buttons to the home page",
  "Notification and settings options to turn on and off",
  "Badges based on specific site activity and milestones",
  "Create private chats with users within each poll chat",
  "Have multiple polls chats open at once",
  "Engage with individual chat messages (likes, emojis, etc.)",
  "Search and filter options within each chat",
  "Ability to make polls private, only visible to the people you invite",
  "Direct messaging users",
  "Mobile app with all features",
  "Add specifics contacts to be notified when they join the site",
];
