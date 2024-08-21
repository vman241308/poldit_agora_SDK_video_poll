import { useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Flex,
  useDisclosure,
  useToast,
  Text,
  Button,
  HStack,
  IconButton,
  Tooltip,
  Collapse,
  Stack,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { BiErrorCircle, BiSelectMultiple } from "react-icons/bi";

import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  withEmbeds,
  withInlines,
} from "_components/pageComponents/Editor/plugins";
import { BaseSelection, createEditor, Descendant } from "slate";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import MiniTextEditor from "_components/pageComponents/Editor/MiniEditor";
import { ISubTopic, ITopic, User } from "_components/appTypes/appType";
import { getToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import { RiFilePaper2Line, RiSendPlaneFill } from "react-icons/ri";
import { FiTrash } from "react-icons/fi";
import Scrollbars from "_components/pageComponents/Other/Scrollbar";
import { TPublishToChannel } from "_components/hooks/channel/useChannel";

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const txtMax = 1000;

const initalContentCounts = { contentCount: 0, mediaCount: 0 };

interface VideoQuestionProps {
  questionId: string;
  topic: string;
  subtopics: ISubTopic[];
  sort: (btn: string) => void;
  sortBy: string;
  user: User;
  broadcast: TPublishToChannel;
}

const errList = [
  "Question already exists.  Please create a different question.",
  "UnAuthorized Access !",
  "Content contains inappropriate language.  Please update and resubmit.",
];

const QuestionInput = (props: VideoQuestionProps) => {
  const ref = useRef();
  const toast = useToast();
  const [charCount, setCharCount] = useState(initalContentCounts);
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isModalOpen, onOpen, onClose } = useDisclosure();
  // const [isMulti, setIsMulti] = useState(false);
  const [multiOptions, setMultiOptions] = useState<[] | string[]>([]);
  const [optionText, setOptionText] = useState<string>("");

  const [editor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );
  const [editorValue, setEditorValue] = useState(initialValue);

  // const handleMulti = () => setIsMulti(!isMulti);

  const [createPoll, { loading }] = useMutation(
    GraphResolvers.mutations.CREATE_POLL,
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
          id: "createPollSuccess",
          duration: 2000,
          iconSize: "20px",
          msg: "Poll created successfully",
          position: "bottom",
        });
      },
    }
  );

  const clearEditor = () => {
    CustomEditor.deleteForwardContent(
      { anchor: { path: [0, 0], offset: 0 } } as BaseSelection,
      editor
    );
  };

  const handleEditorUpdates = (nodes: Descendant[]) => {
    const counts = CustomEditor.getContentLength(nodes);

    if (counts.contentCount < txtMax) {
      setEditorValue(editorValue);
    }
  };

  const submitQuestion = async () => {
    const content = CustomEditor.getPlainText(editor.children);

    if ((isOpen && multiOptions.length < 2) || multiOptions.length > 5) {
      getToasts(toast, "error", {
        id: "minMaxMulti",
        duration: 2000,
        iconSize: "20px",
        msg: "Minimum 2 & maximum 5 answer options allowed",
        position: "bottom",
      });
      return;
    }
    let contentState: any = editor.children;

    const pollItem: any = {
      question: JSON.stringify(contentState),
      pollType: isOpen ? "multiChoice" : "openEnded",
      topic: props.topic,
      subTopics: props.subtopics.map((x) => x._id),
      pollImages: [],
      parentPollId: props.questionId,
      isVideo: true,
    };

    if (isOpen) {
      pollItem.answers = multiOptions;
    }

    try {
      await createPoll({ variables: { details: JSON.stringify(pollItem) } });
      clearQuestion();
      props.sort(props.sortBy);
    } catch (err: any) {
      const errMssg = err.message as string;

      const displayMssg = errList.includes(errMssg)
        ? errMssg
        : "Error! Cannot create Poll";

      getToasts(toast, "error", {
        id: "submitQuestionError",
        duration: 2000,
        iconSize: "20px",
        msg: displayMssg,
        position: "bottom",
      });
    }
  };

  const clearQuestion = () => {
    clearEditor();
    setMultiOptions([]);
  };

  const deleteOption = (o: string) => {
    const filterOption = multiOptions.filter((x) => x !== o);
    setMultiOptions([...filterOption]);
  };

  const handleOptions = () => {
    if (!optionText) return;
    if (multiOptions.length >= 5) {
      getToasts(toast, "error", {
        id: "submitQuestionError",
        duration: 2000,
        iconSize: "20px",
        msg: "You can only have up to 5 options!",
        position: "bottom",
      });
      return;
    }
    const findOpt = multiOptions.find(
      (x) => x.toLowerCase() === optionText.toLowerCase()
    );
    if (findOpt) {
      getToasts(toast, "error", {
        id: "submitQuestionError",
        duration: 2000,
        iconSize: "20px",
        msg: "You cannot have the same option twice.",
        position: "bottom",
      });
      return;
    }
    setMultiOptions([...multiOptions, optionText]);
    setOptionText("");
  };

  const getSubmitColor = () => {
    charCount.contentCount === 0 ? "gray.500" : "poldit.100";
    switch (true) {
      case !isOpen && charCount.contentCount > 0:
        return "poldit.100";
      case isOpen && charCount.contentCount > 0 && multiOptions.length >= 2:
        return "poldit.100";
      default:
        return "gray.500";
    }

    // if (!isOpen && charCount.contentCount === 0) {
    //   color = "gray.500";
    //   return
    // }
  };

  return (
    <Box
      borderRadius="xl"
      bgColor="white"
      borderWidth="1px"
      borderColor="#d2d2d7"
      color="gray.700"
      position="relative"
      fontSize={"sm"}
    >
      <MiniTextEditor
        styles={{
          bg: "white",
          // border: "1px solid #DAE1E4",
          borderRadius: "10px",
          overflow: "auto",
        }}
        inputData={{
          txtMax,
          editorType: "Create Poll",
          placeholderTxt: "Ask a Question",
          minHeight: "35px",
          maxHeight: "250px",
          editor: editor,
          input: editorValue,
          updateInput: handleEditorUpdates,
          countCharacters: setCharCount,
          charCount: charCount,
        }}
      />
      <Collapse in={isOpen} animateOpacity>
        <MultiChoice
          handleMulti={handleOptions}
          options={multiOptions}
          deleteOption={deleteOption}
          optionText={optionText}
          setOptionText={setOptionText}
        />
      </Collapse>
      <Flex justify={"space-between"} mr="3" alignItems={"center"}>
        <Text
          fontSize={"xs"}
          pl="3"
          color={charCount.contentCount === txtMax ? "red.500" : "gray.500"}
        >{`${charCount.contentCount}/${txtMax}`}</Text>
        <HStack spacing={"0.5"}>
          <Tooltip
            label={`Make this a ${
              isOpen ? "standard" : "multiple choice"
            } question`}
            placement="top"
            hasArrow
            rounded="md"
            w="120px"
            textAlign={"center"}
          >
            <IconButton
              variant="outline"
              border={"white"}
              size="sm"
              _focus={{ outline: "none" }}
              _hover={{
                bg: "gray.200",

                outline: "none",
              }}
              fontSize="lg"
              color={"gray.500"}
              aria-label="Send email"
              icon={!isOpen ? <BiSelectMultiple /> : <RiFilePaper2Line />}
              onClick={() => {
                if (multiOptions.length > 0 && isOpen) {
                  onOpen();
                  return;
                }
                onToggle();
              }}
            />
          </Tooltip>
          <Tooltip
            label={`Submit Question`}
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
                outline: "none",
              }}
              fontSize="lg"
              color={getSubmitColor()}
              aria-label="Send email"
              icon={<RiSendPlaneFill />}
              onClick={submitQuestion}
            />
          </Tooltip>
        </HStack>
      </Flex>
      <MultiWarning
        isOpen={isModalOpen}
        onClose={onClose}
        options={multiOptions}
        setMulti={setMultiOptions}
        onToggle={onToggle}
      />
    </Box>
  );
};

export default QuestionInput;

interface IMultiChoiceProps {
  options: string[];
  handleMulti: () => void;
  deleteOption: (option: string) => void;
  optionText: string;
  setOptionText: (val: string) => void;
}

const MultiChoice = ({
  options,
  handleMulti,
  deleteOption,
  optionText,
  setOptionText,
}: IMultiChoiceProps) => {
  return (
    <Box mt="3" fontSize="sm" mb="3">
      <Scrollbars
        autoHeight
        style={{
          overflowY: "auto",
          maxHeight: "400px",
          paddingRight: "15px",
          paddingLeft: "10px",
        }}
      >
        <Text fontSize={"sm"} color="gray.500" mt="2" mb="4">
          Enter 2 - 5 options
        </Text>
        <HStack align="center" spacing={"6"}>
          <Input
            type="text"
            placeholder="Add Multiple Choice Option..."
            borderColor="gray.300"
            _focus={{ borderColor: "poldit.100" }}
            size="sm"
            maxLength={500}
            maxW="350px"
            value={optionText}
            onChange={(e) => setOptionText(e.target.value)}
          />
          <Text color="gray.500" fontSize="sm">
            {optionText.length}/500
          </Text>
          <Button
            borderColor="green.500"
            borderWidth="1px"
            bg="green.400"
            color="white"
            _hover={{ bg: "green.500", color: "white" }}
            _active={{ bg: "green.500", color: "white" }}
            _focus={{ outline: "none" }}
            size="sm"
            onClick={handleMulti}
          >
            Add
          </Button>
        </HStack>
        {options && options.length > 0 ? (
          <Stack mt="3">
            {options.map((o, idx) => (
              <Flex key={idx} align="center">
                <Box bg="gray.200" px="3" py="1" borderRadius="md">
                  <Text color="gray.600" whiteSpace="normal">
                    <Text color="gray.500" fontSize="xs" mr="1" as="span">
                      {idx + 1}.
                    </Text>
                    {o}
                  </Text>
                </Box>
                <IconButton
                  ml="2"
                  bg="gray.200"
                  aria-label="closeIcons"
                  icon={<FiTrash size="12" />}
                  color="red.400"
                  mb="1px"
                  onClick={() => deleteOption(o)}
                  cursor="pointer"
                  size="xs"
                  _focus={{ outline: "none" }}
                />
              </Flex>
            ))}
          </Stack>
        ) : null}
      </Scrollbars>
    </Box>
  );
};

interface IMultiWarrningProps {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
  setMulti: Dispatch<SetStateAction<string[] | []>>;
  onToggle: () => void;
}

const MultiWarning = ({
  isOpen,
  onClose,
  options,
  setMulti,
  onToggle,
}: IMultiWarrningProps) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalBody color="gray.500">
        If you switch to a standard question, you will lose your multiple choice
        selections. Do you want to continue?
      </ModalBody>
      <ModalFooter>
        <Button
          colorScheme={"red"}
          _focus={{ outline: "none" }}
          onClick={() => {
            setMulti([]);
            onClose();
            onToggle();
          }}
        >
          Continue
        </Button>
        <Button
          colorScheme={"blackAlpha"}
          _focus={{ outline: "none" }}
          ml="5"
          onClick={onClose}
        >
          Cancel
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
