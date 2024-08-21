import {
  Box,
  Flex,
  useOutsideClick,
  useToast,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  CompositeDecorator,
  convertToRaw,
  EditorState,
  RawDraftContentState,
} from "draft-js";
// import { LinkStrategy, LinkText } from "../../Other/RichText/Decorators";
import { useEffect, useRef, useState } from "react";
// import CustomEditor from "_components/pageComponents/Other/RichText";
import { useAuth } from "_components/authProvider/authProvider";

import {
  getSecureImgLinks,
  SecureImg,
} from "_components/globalFuncs/apiHelpers";
import dynamic from "next/dynamic";
import { BaseSelection, createEditor, Descendant } from "slate";
import {
  withEmbeds,
  withInlines,
} from "_components/pageComponents/Editor/plugins";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import CustomToast from "_components/pageComponents/Other/Toast";
import { BiErrorCircle } from "react-icons/bi";
import AppMssg from "_components/pageComponents/Other/AppMssgs";

interface AddAnswerInput {
  addAnswer: any;
  // addAnswer: (
  //   answer: string | RawDraftContentState,
  //   answerImage: string
  // ) => void;
  answersLeft: number;
  limit: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  submitLoading: boolean;
}

const PolditEditor = dynamic(
  () => import("_components/pageComponents/Editor"),
  {
    ssr: false,
  }
);

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const txtMax = 1000;
const mediaMax = 1;

const AddAnswerInput = ({
  addAnswer,
  answersLeft,
  limit,
  isOpen,
  onOpen,
  onClose,
  submitLoading,
}: AddAnswerInput) => {
  const ref = useRef();
  const toast = useToast();
  const appContext = useAuth();

  const [editor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );

  const [editorValue, setEditorValue] = useState(initialValue);
  const [answer, setAnswer] = useState("");
  const [selectedImgs, setSelectImgs] = useState<any>([]);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const submitAnswer = async () => {
    const content = CustomEditor.getPlainText(editor.children);

    if (content.length === 0) {
      toast({
        id: "fieldEmpty",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Answer field cannot be empty"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });

      return;
    }

    let contentState: any = editor.children;
    const securedImgs: string[] = [];

    contentState = await Promise.all(
      contentState.map(async (x: any) => {
        if (x.type === "image") {
          const imgMatch = selectedImgs.filter(
            (img: any) => img.name === x.name
          );
          const url: any = await getSecureImgLinks(
            imgMatch,
            appContext?.authState.getUserData._id,
            "poll"
          );
          securedImgs.push(url[0].img);
          return { ...x, url: url[0].img };
        }
        return x;
      })
    );

    addAnswer(
      JSON.stringify(contentState),
      securedImgs.length > 0 ? securedImgs[0] : ""
    ).then((res: any) => res === "done" && clearAnswer());
  };

  const handleEditorUpdates = (nodes: Descendant[]) => {
    const counts = CustomEditor.getContentLength(nodes);

    if (counts.contentCount < txtMax) {
      setEditorValue(editorValue);
    }
  };

  const clearEditor = () => {
    CustomEditor.deleteForwardContent(
      { anchor: { path: [0, 0], offset: 0 } } as BaseSelection,
      editor
    );
  };

  const clearAnswer = () => {
    clearEditor();
    setSelectImgs([]);
    onClose();
  };

  const placeholderTxt =
    answersLeft === 0
      ? "You have reached your answer limit!"
      : `Write an answer. You can submit ${answersLeft} more!`;

  return (
    <Box position="relative">
      {appContext?.isLoggedIn && answersLeft == 0 && (
        <Flex
          ref={ref as any}
          h="40px"
          borderRadius="xl"
          bgColor="#f2f2f2"
          borderWidth="1px"
          borderColor="#d2d2d7"
          alignItems={"center"}
        >
          <Text
            color="gray.500"
            fontWeight={"semibold"}
            fontSize="sm"
            id="answerInput"
            pl="5"
          >
            {placeholderTxt}
          </Text>
        </Flex>
      )}
      {appContext?.isLoggedIn && answersLeft > 0 && (
        <Flex
          ref={ref as any}
          css={{
            height: isOpen ? "100%" : "40px",
            transition: "height .4s",
          }}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="#d2d2d7"
        >
          <Flex direction="column" w="100%" justifyContent={"center"}>
            {!isOpen && (
              <Text
                onClick={onOpen}
                color="gray.500"
                fontWeight={"semibold"}
                fontSize="sm"
                id="answerInput"
                pl="3"
              >
                {placeholderTxt}
              </Text>
            )}
            {isOpen && (
              <Box>
                <PolditEditor
                  styles={{
                    border: "1px solid #DAE1E4",
                    borderRadius: "5px",
                    overflow: "auto",
                  }}
                  inputData={{
                    txtMax,
                    editorType: "Create Answer",
                    mediaMax,
                    placeholderTxt: "Answer away...",
                    minHeight: "150px",
                    maxHeight: "550px",
                    imgs: selectedImgs,
                    editor: editor,
                    input: editorValue,
                    updateInput: handleEditorUpdates,
                    updateImgs: setSelectImgs,
                  }}
                />
                <Flex justifyContent="flex-end" mr="5" pb="3" mt="3">
                  <Button
                    mr="6"
                    variant="outline"
                    size="sm"
                    color="poldit.100"
                    id="submit_open_answer"
                    borderColor="poldit.100"
                    _hover={{ bg: "poldit.100", color: "white" }}
                    _active={{ outline: "none" }}
                    _focus={{ outline: "none" }}
                    isLoading={submitLoading}
                    onClick={submitAnswer}
                  >
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    color="gray.500"
                    borderColor={"gray.800"}
                    _active={{ outline: "none" }}
                    _focus={{ outline: "none" }}
                    onClick={clearAnswer}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Box>
            )}
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
export default AddAnswerInput;
