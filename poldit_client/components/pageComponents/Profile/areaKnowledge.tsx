import {
  Box,
  Flex,
  HStack,
  Spinner,
  Tag,
  Text,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  InputGroup,
  Input,
  Button,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { useEffect, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { HiLightBulb } from "react-icons/hi";
// import Scrollbars from "react-custom-scrollbars-2";
import {
  AreaOfKnowledge,
  MyAreaOfKnowledge,
} from "_components/appTypes/appType";
import { filterSearchVals } from "_components/formFuncs/miscFuncs";
import {
  updateAreaOfKnowledge,
  updateMyAreasOfKnowledge,
} from "lib/apollo/apolloFunctions/mutations";
import { IoIosClose } from "react-icons/io";
import { InfoBtn } from "../Other/Button/miscButtons";
import Scrollbars from "../Other/Scrollbar";

const { AREAS_OF_KNOWLEDGE, MY_AREAS_OF_KNOWLEDGE } = GraphResolvers.queries;
const { ADD_AREA_OF_KNOWLEDGE, REMOVE_AREA_OF_KNOWLEDGE, SET_MY_ACTIVE_AREAS } =
  GraphResolvers.mutations;

interface AreaWindow {
  myAreas: MyAreaOfKnowledge[];
  appid: string;
}

export const AddArea = ({ myAreas, appid }: AreaWindow) => {
  const toast = useToast();
  const { data, loading } = useQuery(AREAS_OF_KNOWLEDGE);
  const [addArea] = useMutation(ADD_AREA_OF_KNOWLEDGE, {
    onCompleted: (res) =>
      toast({
        title: "Area of knowledge created successfully!",
        status: "success",
        isClosable: true,
        duration: 3000,
      }),
    onError: (err) =>
      toast({
        title: err.message,
        status: "error",
        isClosable: true,
        duration: 3000,
      }),
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleAddArea = (area: string) => {
    updateAreaOfKnowledge(addArea, area);
  };

  return (
    <Box mr="2">
      <Tooltip
        hasArrow
        placement="top-start"
        label="Add/Remove Areas of Knowledge"
      >
        <IconButton
          aria-label="AreaBtn"
          fontSize={"22px"}
          icon={<HiLightBulb />}
          isRound={true}
          color="gray.600"
          bgColor={"yellow.200"}
          size="sm"
          onClick={onOpen}
          _hover={{ color: "yellow.200", bgColor: "gray.600" }}
        />
      </Tooltip>
      <AreaKnowledgeModal
        isOpen={isOpen}
        onClose={onClose}
        data={data?.areasOfKnowledge}
        add={handleAddArea}
        myAreas={myAreas}
        appid={appid}
      />
    </Box>
  );
};

interface AreaModal {
  isOpen: boolean;
  onClose: () => void;
  data: AreaOfKnowledge[] | undefined;
  add: (area: string) => void;
  myAreas: MyAreaOfKnowledge[];
  appid: string;
}

export const AreaKnowledgeModal = ({
  isOpen,
  onClose,
  data,
  add,
  myAreas,
  appid,
}: AreaModal) => {
  const toast = useToast();
  const [userArea, setUserArea] = useState("");
  const [areaList, setAreaList] = useState<AreaOfKnowledge[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<AreaOfKnowledge[]>([]);

  const [selectMyAreas, { loading }] = useMutation(SET_MY_ACTIVE_AREAS, {
    onCompleted: (res) => {
      toast({
        title: res.setMyActiveAreas,
        status: "success",
        isClosable: true,
        duration: 2000,
      });
      onClose();
    },

    onError: (err) =>
      toast({
        title:
          "Something went wrong!  Please try selecting the areas of knowledge again and re-submit.",
        status: "error",
        isClosable: true,
        duration: 3000,
      }),
  });

  const chooseMyAreas = () => {
    updateMyAreasOfKnowledge(selectMyAreas, selectedAreas, appid);
    // selectMyAreas({ variables: { areas } });
  };

  const updateAreaList = (area: AreaOfKnowledge, isActive: boolean) => {
    const updatedAreaList = areaList.map((item) => {
      if (item._id === area._id) {
        return { ...item, isActive };
      }
      return item;
    });

    setAreaList(updatedAreaList);
  };

  const clearSelection = (area: AreaOfKnowledge) => {
    const updatedSelections = selectedAreas.filter(
      (item) => item._id !== area._id
    );

    setSelectedAreas(updatedSelections);
    updateAreaList(area, false);
  };

  const onSelectHandler = (area: AreaOfKnowledge) => {
    const selectedMatch = selectedAreas.some((x) => x._id === area._id);

    if (selectedMatch) {
      toast({
        title:
          "You've already selected that area.  You cannot select the same area.",
        status: "error",
        isClosable: true,
        duration: 2000,
      });
      return;
    }

    if (selectedAreas.length < 5 && !selectedMatch) {
      setSelectedAreas([...selectedAreas, area]);
      updateAreaList(area, true);
      return;
    }

    toast({
      title:
        "You've reached the maximumum number of selections. Remove an area to select a new one.",
      status: "error",
      isClosable: true,
      duration: 2000,
    });
  };

  //   const resetWindow = () => {
  //     setUserArea("");
  //     // prepInitialData();
  //   };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const selectedData = data?.map((item) => {
      const selectedMatch = selectedAreas.some((x) => x._id === item._id);
      return { ...item, isActive: selectedMatch };
    });

    const srchTxt = typeof e === "string" ? e : e.target.value;

    const searchResults = filterSearchVals(
      selectedData as AreaOfKnowledge[],
      srchTxt,
      "areaKnowledge"
    );

    setUserArea(srchTxt);
    setAreaList(searchResults);
  };

  const hasData = data && data.length > 0 ? true : false;

  const prepInitialData = () => {
    const updatedData = data?.map((item) => {
      const myAreaMatch = myAreas.some((x) => x.areaKnowledgeId === item._id);
      return { ...item, isActive: myAreaMatch };
    });
    setAreaList(updatedData as AreaOfKnowledge[]);
  };

  useEffect(() => {
    if (data && myAreas) {
      prepInitialData();
      const mySelectedAreas = myAreas.map((item) => item.areaknowledge_data);
      setSelectedAreas(mySelectedAreas);
    }
  }, [data]);

  return (
    <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          alignItems="center"
          borderBottom="1px solid #dbdbdb"
          p="2"
          pl="3.5"
        >
          <HStack spacing="2">
            <Text>Areas of Knowledge</Text>
            <Box pb="1">
              <InfoBtn
                msgTxt="Showcase up to 5 areas of knowledge! Search existing areas and add new ones if not there."
                size="18px"
                placement="right"
                onModal={true}
                msgSize="sm"
              />
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton
          _focus={{ outline: "none" }}
          onClick={() => onChangeHandler("")}
        />
        <ModalBody p="1">
          {!data ? (
            <Flex justify="center" align="center" minH="380px">
              <Spinner size="lg" color="poldit.100" />
            </Flex>
          ) : (
            <Box h="100%">
              <Box>
                <form>
                  <Flex py="2" px={[4, 3]} bg="white">
                    <InputGroup>
                      <Input
                        name="msg"
                        type="text"
                        borderRadius="6px 0 0 6px"
                        placeholder="Search existing areas or add a new area"
                        id="msg"
                        value={userArea}
                        onChange={onChangeHandler}
                        _focus={{ borderColor: "poldit.100" }}
                        maxLength={30}
                        autoComplete="off"
                      />
                    </InputGroup>
                    <Button
                      ml="1"
                      bg="gray.700"
                      borderRadius="0 6px 6px 0"
                      _focus={{ outline: "none" }}
                      _hover={{ bg: "gray.800" }}
                      onClick={(e) => {
                        e.preventDefault();
                        add(userArea);
                        setUserArea("");
                      }}
                      type="submit"
                    >
                      {areaList.length === 0 && userArea.length > 0 ? (
                        <FaPlus color="white" size="18px" />
                      ) : (
                        <FaSearch color="white" size="20px" />
                      )}
                    </Button>
                  </Flex>
                </form>
              </Box>
              <Text
                pl="3.5"
                pt="2"
                pb="2"
                color="gray.600"
                fontWeight={"semibold"}
              >
                Select Area(s)
              </Text>
              <Box m="8px" bg="#f2f2f2" rounded="10px">
                <Scrollbars style={{ height: "270px" }}>
                  <Flex
                    p="2"
                    direction="column"
                    h="full"
                    id="areaKnowledgeScroller"
                  >
                    {!hasData ? (
                      <Flex justify="center" align="center" flex={1}>
                        <Text color="gray.500" mt="2" fontSize="sm">
                          Start adding areas of knowledge!
                        </Text>
                      </Flex>
                    ) : (
                      areaList.map((x) => (
                        <Flex key={x._id}>
                          <Tag
                            my="1"
                            px="2"
                            py="2"
                            fontWeight="bold"
                            color={x.isActive ? "white" : "gray.500"}
                            bg={x.isActive ? "poldit.100" : "gray.200"}
                            _hover={{ color: "gray.100", bg: "poldit.100" }}
                            size="sm"
                            onClick={() => onSelectHandler(x)}
                            borderRadius="full"
                            cursor={"pointer"}
                          >
                            {x.areaKnowledge}
                          </Tag>
                        </Flex>
                      ))
                    )}
                  </Flex>
                </Scrollbars>
              </Box>
            </Box>
          )}

          <Box p="1" pl="3">
            <Flex>
              <Text
                // fontSize={"sm"}
                fontWeight={"semibold"}
                textColor={"gray.600"}
              >
                Selected Areas
              </Text>
            </Flex>
            <Flex gridGap="2" mt="4" wrap="wrap">
              {selectedAreas.map((item) => (
                <Tag
                  key={item._id}
                  px="3"
                  fontWeight="semi-bold"
                  color="white"
                  bg="poldit.100"
                  size="sm"
                  borderRadius="full"
                >
                  {item.areaKnowledge}
                  <Box
                    cursor={"pointer"}
                    pl="1"
                    onClick={() => clearSelection(item)}
                  >
                    <IoIosClose color="white" size="22px" />
                  </Box>
                </Tag>
              ))}
            </Flex>
            <Flex mt="3" justify={"space-between"} align="center">
              <Text
                color={"gray.500"}
                fontWeight={"semibold"}
                fontSize={"sm"}
              >{`${selectedAreas.length}/5`}</Text>
              <Button
                size="xs"
                variant="outline"
                color="#ff4d00"
                borderColor="#ff4d00"
                _hover={{ bg: "#ff4d00", color: "white" }}
                _active={{ outline: "none" }}
                _focus={{ outline: "none" }}
                loadingText="Submitting"
                isLoading={loading}
                onClick={chooseMyAreas}
              >
                Submit
              </Button>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const MyAreasOfKnowledge = ({ data }: { data: MyAreaOfKnowledge[] }) => {
  if (data) {
    return (
      <Flex gridGap="2" wrap="wrap">
        {data.map((x: any) => (
          <Tag
            fontWeight="bold"
            color="gray.500"
            bg="white"
            _hover={{ color: "gray.100", bg: "gray.400" }}
            size="sm"
            borderRadius="full"
            key={x._id}
          >
            {x.areaknowledge_data.areaKnowledge}
          </Tag>
        ))}
      </Flex>
    );
  }

  return <Spinner size="sm" color="poldit.100" />;
};
