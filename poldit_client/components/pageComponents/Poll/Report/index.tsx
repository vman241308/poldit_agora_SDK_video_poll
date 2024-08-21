import { useMutation } from "@apollo/client";
import {
  Badge,
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Spinner,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Button,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import CustomToast from "_components/pageComponents/Other/Toast";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { reportList } from "./reportList";

interface ReportModal {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

interface ReportList {
  active: boolean;
  rptType: string;
}

interface Content {
  contentId: string;
  contentType: string;
  creator: string;
}

const ReportContent = ({ content, isOpen, onClose }: ReportModal) => {
  const toast = useToast();
  const [contentList, setContentList] = useState<ReportList[]>(reportList);

  const updateContentType = (selectedIdx: number) => {
    const updatedContentList = contentList.map((item, idx) => {
      if (idx === selectedIdx) {
        return { ...item, active: true };
      }
      return { ...item, active: false };
    });

    setContentList(updatedContentList);
  };

  const onCancel = () => {
    setContentList(reportList);
    onClose();
  };
  const [reportContent] = useMutation(GraphResolvers.mutations.REPORT_CONTENT);

  const reportPollContent = async () => {
    const { contentId, contentType, creator } = content;

    const category = contentList.find((item) => item.active);

    if (!category) {
      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Please select a category when reporting content."}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      return;
    }

    try {
      const resp = await reportContent({
        variables: {
          contentId,
          contentType,
          category: category.rptType,
          creator,
        },
      });
      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={resp.data.reportContent}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });
      onCancel();
    } catch (err) {
      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={
              "Something went wrong.  Unable to report content!  Please try again later."
            }
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      scrollBehavior="inside"
      size={"lg"}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader
          color="poldit.100"
          minW={"100%"}
          textAlign="center"
          fontSize={"2xl"}
        >
          Report Content
        </ModalHeader>
        <ModalCloseButton
          variant="ghost"
          mt="3"
          _active={{ outline: "none" }}
          _focus={{ outline: "none" }}
        />
        <ModalBody>
          <Text fontWeight={"bold"} fontSize="lg" color="gray.600">
            Report Content To Poldit Admins
          </Text>
          <Text color="gray.500" mt="1" fontSize={"15px"}>
            Select the category below to let us know what is wrong with the
            content. Dont worry, your identity will be anonymous to the content
            creator. Our admins will review and take the necessary actions.
          </Text>

          <UnorderedList listStyleType={"none"} m="0" mt="5" p="0">
            {contentList.map((item, idx) => (
              <ListItem
                key={idx}
                _hover={{ bg: "gray.200" }}
                p="3"
                mb="2"
                bg={item.active ? "poldit.100" : "gray.100"}
                rounded={"md"}
                textAlign="center"
                color={item.active ? "white" : "gray.500"}
                cursor={"pointer"}
                onClick={() => updateContentType(idx)}
              >
                {item.rptType}
              </ListItem>
            ))}
          </UnorderedList>
        </ModalBody>

        <ModalFooter>
          <Button
            alignSelf={"center"}
            borderColor="poldit.100"
            borderWidth="1px"
            bg="poldit.100"
            color="white"
            mr="5"
            _hover={{ bg: "poldit.100", color: "white" }}
            _active={{ bg: "white", color: "poldit.100" }}
            _focus={{ outline: "none" }}
            onClick={reportPollContent}
          >
            Report
          </Button>
          <Button
            variant="solid"
            onClick={onCancel}
            _focus={{ outline: "none" }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReportContent;
