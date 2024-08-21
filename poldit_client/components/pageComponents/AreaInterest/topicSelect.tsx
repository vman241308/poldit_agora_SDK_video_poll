import {
  Box,
  Stack,
  Flex,
  Text,
  Center,
  Spinner,
  SimpleGrid,
  Button,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ITopic } from "_components/appTypes/appType";
import GraphResolvers from "_apiGraphStrings/index";
import { useMutation, useQuery } from "@apollo/client";
import { BoxError } from "../Error/compError";
import CustomToast from "../Other/Toast";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { BiErrorCircle } from "react-icons/bi";
import { getToasts } from "../Other/Toast/toastTypes";

interface IProps {
  onClose: () => void;
  userId: string;
}

interface ISelectedTopic extends ITopic {
  isSelected: boolean;
}

const TopicSelection = ({ onClose, userId }: IProps) => {
  const toast = useToast();
  const [allTopics, setAllTopics] = useState<ISelectedTopic[]>([]);

  const {
    data: topics,
    loading: topicsLoading,
    error: topicsErr,
  } = useQuery(GraphResolvers.queries.GET_TOPICS, {
    onCompleted: (res) =>
      setAllTopics(
        res.topics.map((x: ISelectedTopic) => {
          return { ...x, isSelected: false };
        })
      ),
  });

  const [addAreas, { loading: areasLoading }] = useMutation(
    GraphResolvers.mutations.ADD_AREAS_INTEREST
  );

  const handleSelections = (btnId: string) => {
    setAllTopics(
      allTopics.map((x) =>
        x._id === btnId ? { ...x, isSelected: !x.isSelected } : x
      )
    );
  };

  const handleSubmit = async () => {
    const selected = allTopics.filter((x) => x.isSelected);

    try {
      await addAreas({
        variables: { details: JSON.stringify(selected) },
        update(cache, res) {
          cache.modify({
            id: `User:${userId}`,
            fields: {
              newUser(cachedData = false, { readField }) {
                return false;
              },
            },
          });
        },
      });
      getToasts(toast, "success", {
        id: "",
        duration: 3000,
        iconSize: "20px",
        msg: "Areas of Interest Updated",
        position: "bottom",
        noId: true,
      });
      onClose();
    } catch (err) {
      getToasts(toast, "error", {
        id: "areaAddErr",
        duration: 3000,
        iconSize: "20px",
        msg: "Something went wrong!  Please refresh page and try again.",
        position: "bottom",
      });
    }
  };

  return (
    <Stack spacing={"5"} mt="2">
      <Box
        rounded={"md"}
        bg="white"
        boxShadow="0 1px 2px hsla(0,0%,0%,0.05),0 1px 4px hsla(0,0%,0%,0.05),0 2px 8px hsla(0,0%,0%,0.05)"
        p="3"
      >
        <Center color="poldit.100" fontSize={"lg"}>
          Topics
        </Center>
        {topicsErr ? (
          <BoxError
            msg="Something went wrong!  Please refresh the page and try again."
            h="200px"
          />
        ) : (
          <>
            {topicsLoading ? (
              <Flex justify="center" align="center" h="500px">
                <Spinner size="lg" color="poldit.100" />
              </Flex>
            ) : (
              <SimpleGrid columns={3} spacing="8" p="3">
                {allTopics.map((x: ISelectedTopic) => (
                  <Button
                    p="2"
                    pb="4"
                    pt="4"
                    bg={x.isSelected ? "poldit.100" : "gray.100"}
                    color={x.isSelected ? "white" : "gray.700"}
                    key={x._id}
                    fontSize={{ sm: "xs", md: "xs", lg: "13px" }}
                    whiteSpace={"normal"}
                    _focus={{ outline: "none" }}
                    // _hover={{ bg: "none" }}
                    onClick={() => handleSelections(x._id)}
                  >
                    {x.topic}
                  </Button>
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Box>
      <Flex flexDirection={"column"} mt="2">
        <Button
          colorScheme="blue"
          alignSelf={"center"}
          w="50%"
          m="2"
          mt="3"
          isLoading={areasLoading}
          onClick={handleSubmit}
          borderColor="poldit.100"
          disabled={allTopics.filter((x) => x.isSelected).length < 3}
          mr="15px"
          ml="15px"
          borderWidth="1px"
          bg="poldit.100"
          color="white"
          _hover={{ bg: "poldit.100", color: "white" }}
          _active={{ bg: "white", color: "poldit.100" }}
          _focus={{ outline: "none" }}
        >
          Save
        </Button>
      </Flex>
    </Stack>
  );
};

export default TopicSelection;
