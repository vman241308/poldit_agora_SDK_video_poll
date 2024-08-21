import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Select,
  Spinner,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure,
  useMediaQuery,
  useToast,
  VStack,
} from "@chakra-ui/react";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import React, { useEffect, useState } from "react";
// import { Scrollbars } from "react-custom-scrollbars";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { FiTrash } from "react-icons/fi";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { addNewSubTopic } from "lib/apollo/apolloFunctions/mutations";
import { CancelPopup, ClearAllPopUp } from "../Other/Modal/Popup";
import RichTxtEditor from "../Other/RichText";
import { EditorState, convertToRaw } from "draft-js";
import Scrollbars from "../Other/Scrollbar";
// import CustomEditor from "../Other/RichText";
import {
  getSecureImgLinks,
  SecureImg,
} from "_components/globalFuncs/apiHelpers";
import { useAuth } from "_components/authProvider/authProvider";
import CustomToast from "../Other/Toast";
import { BiErrorCircle } from "react-icons/bi";
import { emptyContentState } from "../Other/RichText/richTxtFuncs";
// import Editor from "../Other/TextEditor";
import dynamic from "next/dynamic";
import { BaseSelection, createEditor, Descendant, Transforms } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import { CustomEditor } from "../Editor/functions";
import { withEmbeds, withInlines } from "../Editor/plugins";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { User } from "_components/appTypes/appType";

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
const mediaMax = 3;

const CreateNewPoll: React.FC<{}> = () => {
  const router = useRouter();
  const appContext = useAuth();
  const user: User = appContext?.authState?.getUserData;
  interface selectedTopic {
    _id: string;
    name: string;
  }
  const toast = useToast();
  const [selectedTopic, setSelectedTopic] = useState<null | selectedTopic>(
    null
  );

  const [editorState, setEditorState] = useState(
    () => EditorState.createWithContent(emptyContentState)
    // EditorState.createEmpty()
  );

  const [editor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );
  const [editorValue, setEditorValue] = useState(initialValue);

  // const [questionField, setQuestionField] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<[] | selectedTopic[]>([]);
  const [subSearch, setSubSearch] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("openEnded");
  const [subTopics, setSubTopics] = useState<[] | any[]>([]);
  const [options, setOptions] = useState<[] | string[]>([]);
  const [optionText, setOptionText] = useState<string>("");
  const [selectedImgs, setSelectImgs] = useState<any>([]);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clrBtn, toggleClearBtn] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 1000px)");

  // const [pollContent, setPollContent] = useState<RawDraftContentState>();

  const { CREATE_POLL, CREATE_SUBTOPIC } = GraphResolvers.mutations;
  const { GET_TOPICS, GET_SUBTOPICS_PER_TOPIC } = GraphResolvers.queries;
  const [createPoll] = useMutation(CREATE_POLL, {
    onCompleted: (res) => {
      setPollLoading(false);
      toast({
        id: "createPollSuccess",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Poll created successfully"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });

      router.push(`/Polls/${res.createPoll._id}`);
    },
  });
  const [createSubTopic] = useMutation(CREATE_SUBTOPIC, {
    onCompleted: (res) => {
      (document.getElementById("newSubTopicName") as HTMLInputElement).value =
        "";
      handleSubTopics({
        _id: res.createSubTopic._id,
        name: res.createSubTopic.subTopic,
      });
      toast({
        id: "subTopicCreateSuccess",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"SubTopic created"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });
    },
    onError: (err: any) =>
      toast({
        title: err.message,
        status: "error",
        isClosable: true,
        duration: 2000,
      }),
  });

  const {
    data: topicData,
    loading: topicLoading,
    error: topicError,
  } = useQuery(GET_TOPICS);

  const [
    getSubTopics,
    { data: subTopicsData, loading: subTopicLoading, error: subTopicError },
  ] = useLazyQuery(GET_SUBTOPICS_PER_TOPIC);

  useEffect(() => {
    if (selectedTopic && selectedTopic.name) {
      getSubTopics({ variables: { topic: selectedTopic.name } });
    }
  }, [selectedTopic]);

  const handleSubTopics = (obj: { _id: string; name: string }) => {
    let findSt = selectedSub.find((st) => obj._id === st._id);
    if (findSt) {
      return;
    } else if (selectedSub.length >= 5) {
      return;
    } else {
      setSelectedSub([...selectedSub, obj]);
    }
  };

  const removeSubTopic = (x: string) => {
    let filterSub = selectedSub.filter((st) => x !== st._id);
    setSelectedSub([...filterSub]);
  };

  useEffect(() => {
    if (!subTopicLoading && subTopicsData && subTopicsData.subTopicsPerTopic) {
      if (subSearch) {
        const filterSt = subTopicsData?.subTopicsPerTopic.filter((st: any) =>
          st.subTopic.toLowerCase().includes(subSearch.toLowerCase())
        );
        setSubTopics(filterSt);
      } else {
        setSubTopics(subTopicsData?.subTopicsPerTopic);
      }
    }
  }, [subSearch, subTopicsData]);

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

  const deleteOption = (o: any) => {
    const filterOption = options.filter((x) => x !== o);
    setOptions([...filterOption]);
  };

  const submitCreatePoll = async () => {
    const content = CustomEditor.getPlainText(editor.children);
    if (content.length === 0) {
      toast({
        id: "fieldEmpty",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Question field cannot be empty"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });

      return;
    }
    if (!selectedTopic || !selectedTopic._id) {
      toast({
        id: "missingTopic",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Topic is required"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      return;
    }
    let selectedSubTopics = selectedSub.map((st) => st._id);
    if (!selectedSubTopics || !selectedSubTopics.length) {
      toast({
        id: "missingSubTopic",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"SubTopic is required"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      return;
    }
    // let answers;
    if (
      (questionType === "multiChoice" && options.length < 2) ||
      options.length > 5
    ) {
      toast({
        id: "minMaxMulti",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Minimum 2 & maximum 5 answer options allowed"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      return;
    }
    // if (questionType === "multiChoice") {
    //   answers = options;
    // }

    // let contentState = editorState.getCurrentContent();
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
      pollType: questionType,
      isVideo: questionType === "videoPoll",
      topic: selectedTopic._id,
      subTopics: selectedSubTopics,
      pollImages:
        selectedImgs.length > 0 && securedImgs.length > 0 ? securedImgs : [],
    };

    if (questionType !== "openEnded") {
      pollItem.answers = options;
    }

    try {
      setPollLoading(true);
      await createPoll({ variables: { details: JSON.stringify(pollItem) } });
    } catch (err: any) {
      setPollLoading(false);
      if (
        err.message ===
        "Content contains inappropriate language.  Please update and resubmit."
      ) {
        toast({
          id: "badLanguage",
          duration: 2000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={
                "Content contains inappropriate language.  Please update and resubmit."
              }
              bg={"red.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={BiErrorCircle}
            />
          ),
        });
        return;
      }
      if (
        err.message ===
        "Question already exists.  Please create a different question."
      ) {
        toast({
          id: "alreadyExists",
          duration: 2000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={
                "Question already exists.  Please create a different question."
              }
              bg={"red.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={BiErrorCircle}
            />
          ),
        });
        return;
      }
      if (err.message === "Please log in or Register to create a poll.") {
        toast({
          id: "unauthorizedError",
          duration: 3000,
          position: "bottom-right",
          render: () => (
            <CustomToast
              msg={"Please log in or Register to create a poll."}
              bg={"red.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={BiErrorCircle}
            />
          ),
        });
      }
      toast({
        id: "errorPoll",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Error! Cannot create Poll"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  };

  const createSubTopicHandler = async (e: any) => {
    e.preventDefault();
    let newSubTopicName = (
      document.getElementById("newSubTopicName") as HTMLInputElement
    ).value;
    // let newSubTopicDis = (
    //   document.getElementById("newSubTopicDis") as HTMLInputElement
    // ).value;
    if (!newSubTopicName) {
      toast({
        title: "Sub topic name cannot be empty",
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
      return;
    }
    let data = {
      topic: selectedTopic?._id,
      topicVal: selectedTopic?.name,
      subTopic: newSubTopicName,
      // description: newSubTopicDis,
    };

    await addNewSubTopic(createSubTopic, JSON.stringify(data));
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

  const clearNewPoll = () => {
    setQuestionType("openEnded");
    clearEditor();
    // setQuestionField("");
    setSelectedTopic(null);
    setSelectedSub([]);
    setSelectImgs([]);
    setOptions([]);
  };

  return (
    <Box>
      <Box
        border="1px solid #d6d9dc"
        boxShadow="0 1px 2px hsla(0,0%,0%,0.05),0 1px 4px hsla(0,0%,0%,0.05),0 2px 8px hsla(0,0%,0%,0.05)"
        bg="white"
        p="4"
      >
        <Stack ml="1" spacing="3">
          <Text fontSize="xl" fontWeight="bold">
            Ask a poll question
          </Text>
          <Text fontSize="sm" color="gray.600">
            Select Question Type:
          </Text>

          <HStack spacing="2">
            <Button
              variant="outline"
              color={questionType === "openEnded" ? "white" : "#ff4d00"}
              bg={questionType === "openEnded" ? "#ff4d00" : "white"}
              borderColor="#ff4d00"
              p="3"
              _hover={{ outline: "none" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setQuestionType("openEnded")}
            >
              Standard
            </Button>
            <Button
              variant="outline"
              color={questionType === "multiChoice" ? "white" : "#ff4d00"}
              bg={questionType === "multiChoice" ? "#ff4d00" : "white"}
              borderColor="#ff4d00"
              p="3"
              _hover={{ outline: "none" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
              size={isMobile ? "xs" : "sm"}
              onClick={() => setQuestionType("multiChoice")}
            >
              Multiple Choice
            </Button>
            {["rahmad12", "rahmad", "laurenraimondi", "devUser"].includes(
              user?.appid
            ) && (
              <Button
                variant="outline"
                color={questionType === "videoPoll" ? "white" : "#ff4d00"}
                bg={questionType === "videoPoll" ? "#ff4d00" : "white"}
                borderColor="#ff4d00"
                p="3"
                _hover={{ outline: "none" }}
                _active={{ outline: "none" }}
                _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
                size={isMobile ? "xs" : "sm"}
                onClick={() => setQuestionType("videoPoll")}
              >
                Video Poll
              </Button>
            )}
          </HStack>
        </Stack>

        {/* Question field*/}
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
        {questionType === "multiChoice" && (
          <Box mt="2">
            {options && options.length ? (
              <VStack mb="4" align="start">
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
              </VStack>
            ) : null}
            <Text fontSize="md" fontWeight="bold">
              Add Poll Answers
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
        )}

        {/* Topic Header*/}
        <Box mt="6">
          <Flex align="center">
            <Text fontSize="md" fontWeight="bold">
              Select Poll Topic
            </Text>
            {selectedTopic && (
              <Box ml="4">
                <Tag
                  bg="white"
                  color="poldit.100"
                  borderRadius="full"
                  borderColor="poldit.100"
                  borderWidth="1px"
                >
                  <TagLabel>{selectedTopic.name}</TagLabel>
                  <TagCloseButton onClick={() => setSelectedTopic(null)} />
                </Tag>
              </Box>
            )}
          </Flex>
        </Box>
        {/* Topics*/}
        <Box mt="4">
          {topicLoading ? (
            <Spinner ml="4" />
          ) : (
            <Flex wrap="wrap">
              {topicData.topics.map((t: any) => (
                <Box px="2" key={t._id} mb="2">
                  <Tag
                    color={
                      t.topic === selectedTopic?.name ? "white" : "gray.500"
                    }
                    bg={
                      t.topic === selectedTopic?.name
                        ? "poldit.100"
                        : "transparent"
                    }
                    size="lg"
                    variant={
                      t.topic === selectedTopic?.name ? "solid" : "outline"
                    }
                    onClick={() => {
                      setSelectedSub([]);
                      setSelectedTopic({ _id: t._id, name: t.topic });
                    }}
                    cursor="pointer"
                  >
                    <TagLabel>{t.topic}</TagLabel>
                  </Tag>
                </Box>
              ))}
            </Flex>
          )}
        </Box>
        {/* sub topic starts*/}
        <Box>
          {selectedTopic && (
            <Box>
              {/* sub Topics Header*/}
              <Box mt="8">
                <Flex align="center" wrap="wrap">
                  <Text fontSize="md" fontWeight="bold" mb="2">
                    Select Poll SubTopic(s)
                  </Text>

                  {selectedSub &&
                    selectedSub.map((t, id) => (
                      <Box px="2" key={id} mb="2">
                        <Tag
                          bg="white"
                          color="poldit.100"
                          borderRadius="full"
                          borderColor="poldit.100"
                          borderWidth="1px"
                        >
                          <TagLabel>{t.name}</TagLabel>
                          <TagCloseButton
                            onClick={() => removeSubTopic(t._id)}
                          />
                        </Tag>
                      </Box>
                    ))}
                </Flex>
                <Text fontSize={"sm"} color="gray.500">
                  If you don't see a subtopic you want, add a new one by
                  clicking the + below!
                </Text>
              </Box>
              {/* sub Topics Search Input*/}
              <Box mt="4">
                <Input
                  placeholder="Search SubTopics..."
                  borderColor="gray.300"
                  _focus={{ borderColor: "poldit.100" }}
                  maxW="350px"
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  size="sm"
                />
              </Box>
              <Box mt="6">
                {subTopicLoading ? (
                  <Spinner ml="4" />
                ) : (
                  <Scrollbars
                    autoHeight
                    autoHeightMin={100}
                    autoHeightMax={200}
                    style={{ overflowY: "hidden" }}
                  >
                    <Flex wrap="wrap">
                      {subTopics.map((t: any) => (
                        <Box px="2" key={t._id} mb="2">
                          <Tag
                            color={
                              selectedSub.some(
                                (item) => item.name === t.subTopic
                              )
                                ? // t.subtopic === selectedTopic?.name
                                  "white"
                                : "gray.500"
                            }
                            bg={
                              selectedSub.some(
                                (item) => item.name === t.subTopic
                              )
                                ? "poldit.100"
                                : "transparent"
                            }
                            size="lg"
                            variant={
                              selectedSub.some(
                                (item) => item.name === t.subTopic
                              )
                                ? "solid"
                                : "outline"
                            }
                            onClick={() =>
                              handleSubTopics({ _id: t._id, name: t.subTopic })
                            }
                            cursor="pointer"
                          >
                            <TagLabel>{t.subTopic}</TagLabel>
                          </Tag>
                        </Box>
                      ))}
                    </Flex>
                  </Scrollbars>
                )}
              </Box>
              {/*Add new sub topic*/}
              <Box mt="6">
                <Flex justify="space-between" align="center">
                  {isOpen ? (
                    <IconButton
                      aria-label="addNewSubTopic"
                      size="xs"
                      bg="white"
                      onClick={onClose}
                      icon={<AiOutlineMinusSquare size="26" />}
                      _focus={{ outline: "none" }}
                    />
                  ) : (
                    <Tooltip label="Add New Sub-Topic" hasArrow placement="top">
                      <IconButton
                        aria-label="addNewSubTopic"
                        size="xs"
                        bg="white"
                        onClick={onOpen}
                        icon={<AiOutlinePlusSquare size="26" />}
                        _focus={{ outline: "none" }}
                      />
                    </Tooltip>
                  )}
                  <Flex>
                    <Text fontSize="sm" color="gray.600">
                      Select up to 5
                    </Text>
                    <Text fontSize="sm" color="gray.600" ml="6">
                      {selectedSub.length}/5
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Box>
          )}
        </Box>
        {/*Add new sub topic Form*/}
        {isOpen && (
          <Box mt="6">
            <Box>
              <Text fontSize="md" fontWeight="bold">
                Add New Poll SubTopic
              </Text>
            </Box>
            <Box>
              <form>
                <FormControl id="name" isRequired mt="4">
                  <FormLabel fontSize="sm">New SubTopic Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="SubTopics name"
                    borderColor="gray.300"
                    _focus={{ borderColor: "poldit.100" }}
                    id="newSubTopicName"
                    maxW="350px"
                    name="name"
                  />
                </FormControl>
                <Flex mt="4">
                  <Button
                    borderColor="poldit.100"
                    borderWidth="1px"
                    bg="white"
                    color="poldit.100"
                    _hover={{ bg: "poldit.100", color: "white" }}
                    _active={{ bg: "poldit.100", color: "white" }}
                    _focus={{ outline: "none" }}
                    size="sm"
                    type="submit"
                    onClick={createSubTopicHandler}
                  >
                    Add
                  </Button>
                  <Button
                    ml="4"
                    borderColor="gray.500"
                    borderWidth="1px"
                    bg="white"
                    color="gray.500"
                    _hover={{ bg: "gray.500", color: "white" }}
                    _active={{ bg: "gray.500", color: "white" }}
                    _focus={{ outline: "none" }}
                    size="sm"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                </Flex>
              </form>
            </Box>
          </Box>
        )}
        {/* Submit Poll*/}
        <Box mt="6">
          <Flex justify="flex-end" align="center">
            <ClearAllPopUp
              isOpen={clrBtn}
              toggle={toggleClearBtn}
              clear={clearNewPoll}
            />
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
            <CancelPopup
              isOpen={isModalOpen}
              toggle={setIsModalOpen}
              clear={clearNewPoll}
            />
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateNewPoll;
