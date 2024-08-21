import {
  Box,
  Flex,
  Input,
  InputGroup,
  useToast,
  Text,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { BaseSelection, createEditor, Descendant } from "slate";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import MiniTextEditor from "_components/pageComponents/Editor/MiniEditor";
import { getToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  withEmbeds,
  withInlines,
} from "_components/pageComponents/Editor/plugins";
import { useMutation } from "@apollo/client";
import { RiSendPlaneFill } from "react-icons/ri";
import { AddAnswerFn } from "pages/Polls/[id]";
import { User } from "_components/appTypes/appType";
import { TPublishToChannel } from "_components/hooks/channel/useChannel";

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const txtMax = 300;

const initalContentCounts = { contentCount: 0, mediaCount: 0 };

interface AnswerProps {
  pollId: string;
  sortBy: string;
  sortAns: (val: string) => void;
  user: User;
  broadcast: TPublishToChannel;
}

const AnswerInput = (props: AnswerProps) => {
  const toast = useToast();
  const [charCount, setCharCount] = useState(initalContentCounts);

  const [answerEditor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );

  const [editorValue, setEditorValue] = useState(initialValue);

  const [createAnswer, { loading }] = useMutation(
    GraphResolvers.mutations.CREATE_ANSWER,
    {
      onCompleted: (res) => {
        props.broadcast("QA Message", {
          uid: props.user._id,
          appid: props.user.appid,
          profilePic: props.user.profilePic,
          firstname: props.user.firstname,
          lastname: props.user.lastname,
          isMod: false,
          onPanel: false,
          pollStarted: false,
        });
        getToasts(toast, "success", {
          id: "vidAnswerAdded",
          duration: 2000,
          iconSize: "20px",
          msg: "Answer added!",
          position: "bottom",
        });
      },
    }
  );

  const clearAnswer = () => {
    CustomEditor.deleteForwardContent(
      { anchor: { path: [0, 0], offset: 0 } } as BaseSelection,
      answerEditor
    );
  };

  const handleEditorUpdates = (nodes: Descendant[]) => {
    const counts = CustomEditor.getContentLength(nodes);

    if (counts.contentCount < txtMax) {
      setEditorValue(editorValue);
    }
  };

  const submitAnswer = async () => {
    const answer = {
      answer: JSON.stringify(answerEditor.children),
      poll: props.pollId,
      multichoice: [],
      answerImage: "",
      isEditable: true,
      isRemoveable: true,
      isVideo: true,
    };

    try {
      await createAnswer({ variables: { details: JSON.stringify(answer) } });
      clearAnswer();
      props.sortAns(props.sortBy);
    } catch (err: any) {
      getToasts(toast, "error", {
        id: "submitQuestionError",
        duration: 2000,
        iconSize: "20px",
        msg: err.message,
        position: "bottom",
      });
    }
  };

  return (
    <Box
      rounded="md"
      bgColor="white"
      borderWidth="1px"
      borderColor="#d2d2d7"
      color="gray.700"
      w="100%"
      fontSize={"sm"}
    >
      <MiniTextEditor
        styles={{
          bg: "white",
          padding: "5px",

          // border: "1px solid #DAE1E4",
          borderRadius: "10px",
          overflow: "auto",
        }}
        inputData={{
          txtMax,
          editorType: "Create Answer",
          placeholderTxt: "Add an answer",
          minHeight: "35px",
          maxHeight: "250px",
          editor: answerEditor,
          input: editorValue,
          updateInput: handleEditorUpdates,
          countCharacters: setCharCount,
          charCount: charCount,
        }}
      />
      <Flex justify={"space-between"} alignItems={"center"} ml="2" mr="2">
        <Text
          fontSize={"xs"}
          textAlign="center"
          // pl="3"
          color={charCount.contentCount === txtMax ? "red.500" : "gray.500"}
        >{`${charCount.contentCount}/${txtMax}`}</Text>
        <Tooltip
          label={`Submit Answer`}
          placement="top"
          hasArrow
          rounded="md"
          w="80px"
          textAlign={"center"}
        >
          <IconButton
            variant="outline"
            border={"white"}
            size="sm"
            _focus={{ outline: "none" }}
            isLoading={loading}
            disabled={charCount.contentCount === 0}
            _hover={{
              bg: "gray.200",
              // bg: isMulti ? "gray.700" : "white",
              outline: "none",
            }}
            fontSize="lg"
            // bg={isMulti ? "gray.700" : "white"}
            color={charCount.contentCount === 0 ? "gray.500" : "poldit.100"}
            aria-label="Send email"
            icon={<RiSendPlaneFill />}
            onClick={submitAnswer}
          />
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default AnswerInput;
