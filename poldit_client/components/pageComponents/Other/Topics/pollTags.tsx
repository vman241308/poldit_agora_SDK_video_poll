import {
  Flex,
  HStack,
  Input,
  Text,
  Button,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import TopicBox from "_components/pageComponents/Topics/topics";
import Scrollbars from "../Scrollbar";
// import { Scrollbars } from "react-custom-scrollbars-2";
import { ITopic } from "_components/appTypes/appType";
import { addNewSubTopic } from "lib/apollo/apolloFunctions/mutations";

export const getAlphabeticalObjList = (objList: any[], key: string) => {
  return objList.sort((a, b) => {
    const nameA = a[key].toUpperCase();
    const nameB = b[key].toUpperCase();

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });
};

export const AddTopicWindow = ({ close, topics, setTopics }: any) => {
  const toast = useToast();

  const [createTopic] = useMutation(GraphResolvers.mutations.CREATE_TOPIC);

  const handleSubmit = () => {
    const topic = document.getElementById("topicInput") as HTMLInputElement;

    if (topic.value.length > 0) {
      createTopic({
        variables: {
          topicInfo: JSON.stringify({
            topic: topic.value,
            description: "New Topic",
          }),
        },
        onCompleted: (res) => {
          const updatedTopics = getAlphabeticalObjList(
            [...topics, res.createTopic],
            "topic"
          );
          setTopics(updatedTopics);
          toast({
            title: "Sucessfully Added New Topic",
            status: "success",
            isClosable: true,
            duration: 3000,
          });
          topic.value = "";
          close("topic");
        },
        onError: (err) => {
          toast({
            title: err.message,
            status: "error",
            isClosable: true,
            duration: 3000,
          });
        },
      });
    }
  };

  return (
    <>
      <ModalContent>
        <ModalHeader fontWeight="semibold">Add New Topic</ModalHeader>
        <ModalCloseButton
          _active={{ outline: "none", bg: "none" }}
          _focus={{ outline: "none", bg: "none" }}
          _hover={{ bg: "gray.300", color: "white" }}
        />
        <ModalBody>
          <HStack spacing={"2"} w="full" mb="3">
            <Input
              name="topic"
              type={"text"}
              w="lg"
              borderRadius="6px 0 0 6px"
              placeholder="Topic Name..."
              id="topicInput"
              _focus={{ borderColor: "poldit.100" }}
            />

            <Button
              variant="outline"
              color="#ff4d00"
              borderColor="#ff4d00"
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none" }}
              size="md"
              onClick={handleSubmit}
            >
              Create
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </>
  );
};

export const AddSubTopicWindow = ({
  close,
  loading,
  data,
  setSubTopics,
  subTopics,
}: any) => {
  const toast = useToast();

  const [topic, setTopic] = useState<ITopic | null>();
  const [error, setError] = useState(false);

  const [createSubTopic] = useMutation(
    GraphResolvers.mutations.CREATE_SUBTOPIC,
    {
      onCompleted: (res) => {
        const subTopicsOrdered = getAlphabeticalObjList(
          [...subTopics, res.createSubTopic],
          "subTopic"
        );

        setSubTopics(subTopicsOrdered);

        toast({
          title: "Sucessfully Added New SubTopic",
          status: "success",
          isClosable: true,
          duration: 3000,
        });
        close("subtopic");

        (document.getElementById("subTopicInput") as HTMLInputElement).value =
          "";
      },
      onError: (e) => {
        toast({
          title: e.message,
          status: "error",
          isClosable: true,
          duration: 3000,
        });
      },
    }
  );

  const updateTopic = (btnType: string, id: string) => {
    const selectedTopic: ITopic = data.find((item: ITopic) => item._id === id);
    setTopic(selectedTopic);
  };

  const handleSubmit = () => {
    const subTopic = document.getElementById(
      "subTopicInput"
    ) as HTMLInputElement;

    if (subTopic.value.length > 0 && !topic) {
      toast({
        title: "You will need to select a Topic in order to create a SubTopic!",
        status: "error",
        isClosable: true,
        duration: 3000,
      });
    }

    if (subTopic.value.length > 0 && topic) {
      setError(false);

      const subTopicData = JSON.stringify({
        subTopic: subTopic.value,
        topic: topic?._id,
        topicVal: topic?.topic,
        description: "New Sub Topic",
      });

      createSubTopic({ variables: { subTopicInfo: subTopicData } });
    }
  };

  return (
    <>
      <ModalContent>
        <ModalHeader fontWeight="semibold">Add New SubTopic</ModalHeader>
        <ModalCloseButton
          _active={{ outline: "none", bg: "none" }}
          _focus={{ outline: "none", bg: "none" }}
          _hover={{ bg: "gray.300", color: "white" }}
        />
        <ModalBody>
          <Scrollbars style={{ height: "200px" }}>
            <Flex
              minH="100%"
              bg={"#f2f3f4"}
              borderRadius={"md"}
              direction="column"
              justify="flex-start"
              border={"1px"}
              borderColor={"gray.200"}
              w="full"
              p="3"
            >
              <HStack spacing={"3"}>
                <Text fontWeight="semibold">Poll Topics</Text>
                <Text fontWeight="normal" pt="1" fontSize="10px">
                  (Select a topic to associate your subtopic with )
                </Text>
              </HStack>
              <TopicBox
                loading={loading}
                data={data}
                selected={topic}
                update={updateTopic}
                showAll={false}
              />
            </Flex>
          </Scrollbars>

          <HStack spacing={"2"} w="full" mt="5" mb="3">
            <Input
              name="topic"
              type={"text"}
              w="lg"
              borderRadius="6px 0 0 6px"
              placeholder="SubTopic Name..."
              id="subTopicInput"
              _focus={{ borderColor: "poldit.100" }}
            />

            <Button
              variant="outline"
              color="#ff4d00"
              borderColor="#ff4d00"
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none" }}
              size="md"
              onClick={handleSubmit}
            >
              Create
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </>
  );
};
