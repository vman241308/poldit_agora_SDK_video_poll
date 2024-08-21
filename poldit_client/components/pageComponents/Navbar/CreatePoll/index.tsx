import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Button,
  Text,
  Flex,
  Stack,
  Alert,
  AlertIcon,
  IconButton,
  Input,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  ButtonGroup,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { BaseSelection, createEditor, Descendant, Transforms } from "slate";
import {
  withEmbeds,
  withInlines,
} from "_components/pageComponents/Editor/plugins";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import { PollType } from "_components/pageComponents/Home/DataWindow";
import { FiTrash } from "react-icons/fi";
import PolditEditor from "_components/pageComponents/Editor";
import CustomToast from "_components/pageComponents/Other/Toast";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { getSecureImgLinks } from "_components/globalFuncs/apiHelpers";
import { useAuth } from "_components/authProvider/authProvider";
import { useMutation } from "@apollo/client";
import GraphResolvers from "_apiGraphStrings/mutations";
import { useRouter } from "next/router";
import { get_ai_data } from "lib/mlApi";

// const PolditEditor = dynamic(
//   () => import("_components/pageComponents/Editor"),
//   {
//     ssr: false,
//   }
// );

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const txtMax = 1000;
const mediaMax = 3;

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

interface BtnType {
  btnId: string;
  label: string;
  description: string;
}

const btnTypes: BtnType[] = [
  {
    btnId: "openEnded",
    label: "Standard",
    description: "The community and our AI will provide their own answers.",
  },
  {
    btnId: "multiChoice",
    label: "Multiple Choice",
    description: "You can add 2 to 5 answers for people to choose from.",
  },
  {
    btnId: "videoPoll",
    label: "Livestream",
    description:
      "Want to discuss a topic live?  Invite others and engage in an interactive live stream with the community.",
  },
];

const initBtn = {
  btnId: "openEnded",
  label: "Standard",
  description: "The community and our AI will provide their own answers.",
};

const AskQuestion = (props: IProps) => {
  const toast = useToast();
  const appContext = useAuth();
  const router = useRouter();
  const [selectedImgs, setSelectImgs] = useState<any>([]);
  const [questionType, setQuestionType] = useState<BtnType>(initBtn);

  const [editor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );
  const [editorValue, setEditorValue] = useState(initialValue);
  const [options, setOptions] = useState<[] | string[]>([]);
  const [optionText, setOptionText] = useState<string>("");
  const [pollLoading, setPollLoading] = useState(false);
  const [clrBtn, toggleClearBtn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [createPoll] = useMutation(GraphResolvers.CREATE_POLL, {
    onCompleted: (res) => {
      setPollLoading(false);
      // returnToast("success", "Poll created successfully");
      // router.push(`/Polls/${res.createPoll._id}`);
    },
  });

  const handleEditorUpdates = (nodes: Descendant[]) => {
    const counts = CustomEditor.getContentLength(nodes);

    if (counts.contentCount < txtMax) {
      setEditorValue(editorValue);
    }
  };

  const deleteOption = (o: any) => {
    const filterOption = options.filter((x) => x !== o);
    setOptions([...filterOption]);
  };

  const handleOptions = () => {
    if (!optionText) return;
    if (options.length >= 5) {
      toast({
        title: "You can only have up to 5 options",
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
      return;
    }
    const findOpt = options.find(
      (x) => x.toLowerCase() === optionText.toLowerCase()
    );
    if (findOpt) {
      toast({
        title: "You cannot have same option twice",
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
      return;
    }
    setOptions([...options, optionText]);
    setOptionText("");
  };

  const clearEditor = () => {
    CustomEditor.deleteForwardContent(
      { anchor: { path: [0, 0], offset: 0 } } as BaseSelection,
      editor
    );
  };

  const clearNewPoll = () => {
    setQuestionType(initBtn);
    clearEditor();
    setSelectImgs([]);
    setOptions([]);
  };

  const returnToast = (msgType: "success" | "error", mssg: string) =>
    toast({
      duration: 3000,
      position: "bottom",
      render: () => (
        <CustomToast
          msg={mssg}
          bg={msgType === "error" ? "red.300" : "green.300"}
          fontColor={"white"}
          iconSize={"20px"}
          Icon={msgType === "error" ? BiErrorCircle : IoCheckmarkCircleOutline}
        />
      ),
    });

  const submitCreatePoll = async () => {
    const content = CustomEditor.getPlainText(editor.children);
    if (content.length === 0) {
      returnToast("error", "Question field cannot be empty");
      return;
    }

    if (
      (questionType.btnId === "multiChoice" && options.length < 2) ||
      options.length > 5
    ) {
      returnToast("error", "Minimum 2 & maximum 5 answer options allowed");
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
    const pollItem: any = {
      question: JSON.stringify(contentState),
      pollType: questionType.btnId,
      isVideo: questionType.btnId === "videoPoll",
      // topic: "",
      // subTopics: [""],
      pollImages:
        selectedImgs.length > 0 && securedImgs.length > 0 ? securedImgs : [],
    };

    if (questionType.btnId !== "openEnded") {
      pollItem.answers = options;
    }

    try {
      setPollLoading(true);
      const { data } = await createPoll({
        variables: { details: JSON.stringify(pollItem) },
      });
      await get_ai_data("question/classify", {
        pollid: data.createPoll._id,
        question: content.join(""),
        num_subtopics: 5,
      });
      await get_ai_data("question/answer", {
        pollid: data.createPoll._id,
        question: content.join(""),
      });
      returnToast("success", "Poll created successfully");
      // window.history.replaceState(null, `/Polls/${data.createPoll._id}`, )
      await router.push(`/Polls/${data.createPoll._id}`);

      props.onClose();
    } catch (err: any) {
      setPollLoading(false);
      if (
        [
          "Content contains inappropriate language.  Please update and resubmit.",
          "Question already exists.  Please create a different question.",
          "Please log in or Register to create a poll.",
        ].includes(err.message)
      ) {
        returnToast("error", err.message);
        return;
      }
      returnToast("error", "Error! Cannot create Poll");
    }
    setPollLoading(false);
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      size="xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader color="poldit.100" alignSelf={"center"}>
          Ask a Question
        </ModalHeader>
        <Spacer />
        <ModalBody>
          <Stack spacing="4">
            <Flex justifyContent={"space-between"} alignItems={"center"}>
              <Text
                fontSize="sm"
                color="gray.600"
                w="30%"
                fontWeight={"semibold"}
              >
                Select Question Type:
              </Text>
              <HStack spacing="4">
                {btnTypes.map((btn, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    color={
                      questionType.btnId === btn.btnId ? "white" : "#ff4d00"
                    }
                    bg={questionType.btnId === btn.btnId ? "#ff4d00" : "white"}
                    borderColor="#ff4d00"
                    p="3"
                    _hover={{ outline: "none" }}
                    _active={{ outline: "none" }}
                    _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
                    size={props.isMobile ? "xs" : "sm"}
                    onClick={() => setQuestionType(btn)}
                  >
                    {btn.label}
                  </Button>
                ))}
              </HStack>
            </Flex>
            <Alert
              status="info"
              bg="blackAlpha.100"
              fontSize={"sm"}
              rounded="md"
            >
              <Box mr="5">
                <PollType
                  btnStyle={{ size: "18px", color: "gray" }}
                  btnType={questionType.btnId}
                />
              </Box>

              {/* <AlertIcon color="poldit.100" /> */}
              {questionType.description}
            </Alert>

            <Box mt="6">
              <PolditEditor
                styles={{
                  border: "1px solid #DAE1E4",
                  borderRadius: "5px",
                  overflow: "auto",
                }}
                inputData={{
                  txtMax,
                  editorType: "Create Poll",
                  mediaMax,
                  placeholderTxt: "Ask away...",
                  minHeight: "200px",
                  maxHeight: "580px",
                  imgs: selectedImgs,
                  editor: editor,
                  input: editorValue,
                  updateInput: handleEditorUpdates,
                  updateImgs: setSelectImgs,
                }}
              />
            </Box>
            {questionType.btnId === "multiChoice" && (
              <AddMultiChoice
                options={options}
                deleteOption={deleteOption}
                optionText={optionText}
                setOptionText={setOptionText}
                handleOptions={handleOptions}
              />
            )}
            <Box mt="6">
              <Flex justify="flex-end" align="center">
                <BtnWithPopUp
                  clear={clearNewPoll}
                  isOpen={clrBtn}
                  toggle={toggleClearBtn}
                  mssg="Are you sure you want to clear the current question?"
                  btnHeader="Clear All"
                />
                {
                  <Button
                    borderColor="poldit.100"
                    mr="15px"
                    ml="15px"
                    borderWidth="1px"
                    id="create_poll"
                    bg="poldit.100"
                    color="white"
                    _hover={{ bg: "poldit.100", color: "white" }}
                    _active={{ bg: "white", color: "poldit.100" }}
                    _focus={{ outline: "none" }}
                    size="sm"
                    type="submit"
                    onClick={submitCreatePoll}
                    isLoading={pollLoading}
                  >
                    Create Poll
                  </Button>
                }
                <BtnWithPopUp
                  clear={() => {
                    clearNewPoll();
                    props.onClose();
                  }}
                  isOpen={isModalOpen}
                  toggle={setIsModalOpen}
                  mssg="Are you sure you want to return to the previous page? If you started
                  creating a new poll, all of your content will be lost!"
                  btnHeader="Cancel"
                />
              </Flex>
            </Box>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AskQuestion;

interface IMultiProps {
  options?: string[];
  deleteOption: (option: string) => void;
  optionText: string;
  setOptionText: (val: string) => void;
  handleOptions: () => void;
}

const AddMultiChoice = ({
  options,
  deleteOption,
  optionText,
  setOptionText,
  handleOptions,
}: IMultiProps) => {
  return (
    <Box>
      {options && options.length ? (
        <Stack mb="4" align="start">
          {options.map((o, id) => (
            <Flex key={id} align="center">
              <Box bg="gray.200" px="3" py="1" borderRadius="md">
                <Text color="gray.600" whiteSpace="normal">
                  <Text color="gray.500" fontSize="xs" mr="1" as="span">
                    {id + 1}.
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
      <Text fontSize="md" fontWeight="bold">
        Add Poll Answer Options
      </Text>
      <Text fontSize={"sm"} color="gray.500" mt="2" mb="4">
        Enter 2 - 5 options
      </Text>
      <HStack align="center" spacing={"6"}>
        <Input
          type="text"
          placeholder="Enter Option"
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
          onClick={handleOptions}
        >
          Add
        </Button>
      </HStack>
    </Box>
  );
};

interface IBtnPopUp {
  isOpen: boolean;
  toggle: (val: boolean) => void;
  clear: () => void;
  mssg: string;
  btnHeader: string;
}

const BtnWithPopUp = ({
  isOpen,
  toggle,
  clear,
  mssg,
  btnHeader,
}: IBtnPopUp) => {
  return (
    <Popover
      isOpen={isOpen}
      onClose={() => toggle(false)}
      placement="bottom"
      strategy="fixed"
    >
      <PopoverTrigger>
        <Button borderWidth="1px" size="sm" onClick={() => toggle(!isOpen)}>
          {btnHeader}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight="semibold">{btnHeader}</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody fontSize={"sm"}>{mssg}</PopoverBody>
        <PopoverFooter d="flex" justifyContent="flex-end">
          <ButtonGroup size="sm">
            <Button variant="outline" onClick={() => toggle(!isOpen)}>
              Cancel
            </Button>

            <Button
              colorScheme="red"
              onClick={() => {
                clear();
                toggle(false);
              }}
            >
              Continue
            </Button>
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};
