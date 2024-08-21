import { HStack, Flex, IconButton, Box, Text } from "@chakra-ui/react";
import {
  BsHandThumbsDown,
  BsHandThumbsDownFill,
  BsHandThumbsUp,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import { AiOutlineHeart, AiTwotoneHeart } from "react-icons/ai";
import { IconType } from "react-icons/lib/cjs/iconBase";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import {
  RiEmotionLaughFill,
  RiEmotionLaughLine,
  RiEmotionSadFill,
  RiEmotionSadLine,
} from "react-icons/ri";
import { ImAngry, ImAngry2 } from "react-icons/im";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { useMutation } from "@apollo/client";
import { ChatMessage } from "_components/appTypes/appType";

const reactItems = [
  {
    btnName: "like",
    btnColor: "green.300",
    btnSize: "sm",
    btnIconEmpty: BsHandThumbsUp,
    btnIconFill: BsHandThumbsUpFill,
  },
  {
    btnName: "dislike",
    btnColor: "red.300",
    btnSize: "sm",
    btnIconEmpty: BsHandThumbsDown,
    btnIconFill: BsHandThumbsDownFill,
  },
  {
    btnName: "heart",
    btnColor: "red.300",
    btnSize: "lg",
    btnIconEmpty: AiOutlineHeart,
    btnIconFill: AiTwotoneHeart,
  },
  {
    btnName: "laugh",
    btnColor: "yellow.500",
    btnSize: "lg",
    btnIconEmpty: RiEmotionLaughLine,
    btnIconFill: RiEmotionLaughFill,
  },
  {
    btnName: "sadFace",
    btnColor: "red.300",
    btnSize: "lg",
    btnIconEmpty: RiEmotionSadLine,
    btnIconFill: RiEmotionSadFill,
  },
  {
    btnName: "angryFace",
    btnColor: "red.300",
    btnSize: "md",
    btnIconEmpty: ImAngry,
    btnIconFill: ImAngry2,
  },
];

interface ChatReactionBar {
  data: ChatMessage;
  userId: string;
  handleScroll: (val: boolean) => void;
  close: () => void;
}

type BtnData = {
  btnName: string;
  btnColor: string;
  btnSize: string;
  btnIconEmpty: IconType;
  btnIconFill: IconType;
};

const ChatReactionBar = ({
  data,
  userId,
  handleScroll,
  close,
}: ChatReactionBar) => {
  const [handleReaction] = useMutation(
    GraphResolvers.mutations.HANDLE_REACTION
  );

  const handleReactions = (btn: BtnData) => {
    handleScroll(true);
    handleReaction({
      variables: {
        reactionType: btn.btnName,
        reaction: true,
        chatId: data._id,
      },
    }).then((res) => close());
  };

  const getReactionIcon = (btn: BtnData) => {
    const reactionItems = (data as any)[`${btn.btnName}s`];

    if (reactionItems.some((x: any) => x.userId === userId)) {
      return btn.btnIconFill;
    }
    return btn.btnIconEmpty;
  };

  return (
    <HStack spacing={-1} mt="1">
      {reactItems.map((x) => (
        <ReactionItem
          key={x.btnName}
          data={x}
          react={handleReactions}
          chatData={data}
          getIcon={getReactionIcon}
        />
      ))}
    </HStack>
  );
};

export default ChatReactionBar;

interface ReactionItem {
  data: BtnData;
  react: (btn: BtnData) => void;
  chatData: any;
  getIcon: (btn: BtnData) => IconType;
}

const ReactionItem = ({ data, react, chatData, getIcon }: ReactionItem) => {
  const BtnIcon = getIcon(data);

  return (
    <Flex justifyContent="center" alignItems="center">
      <IconButton
        icon={<BtnIcon />}
        cursor="none"
        aria-label={data.btnName}
        id={data.btnName}
        fontSize={data.btnSize}
        variant="ghost"
        _focus={{ outline: "none" }}
        _hover={{ outline: "none" }}
        size="sm"
        color={data.btnColor}
        onClick={() => react(data)}
      />
    </Flex>
  );
};

interface ChatReactBar_Selected {
  data: ChatMessage;
  txtColor: string;
}

export const ChatReactBar_Selected = ({
  data,
  txtColor,
}: ChatReactBar_Selected) => {
  const reactionsCount = reactItems
    .map((x) => {
      return {
        ...x,
        btnName: x.btnName + "s",
        reactCount: (data as any)[`${x.btnName}s`].length,
      };
    })
    .filter((y) => y.reactCount > 0);

  return (
    <HStack spacing={0}>
      {reactionsCount.map((x) => (
        <Flex justifyContent="center" alignItems="center" key={x.btnName}>
          <IconButton
            icon={<x.btnIconFill />}
            aria-label={x.btnName}
            id={x.btnName}
            fontSize={x.btnSize}
            variant="ghost"
            _focus={{ outline: "none", cursor: "default" }}
            _hover={{ outline: "none", cursor: "default" }}
            size="sm"
            color={x.btnColor}
          />
          <Box ml="-1">
            {/* <Text color="gray.700" fontSize="sm"> */}
            <Text color={txtColor} fontSize="sm">
              {numCountDisplay(x.reactCount)}
            </Text>
          </Box>
        </Flex>
      ))}
    </HStack>
  );
};
