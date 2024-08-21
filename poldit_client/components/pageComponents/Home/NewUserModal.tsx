import { useMutation } from "@apollo/client";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Text,
  Spacer,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { Selected } from "../AreaInterest";
import AreasInterestModal from "../AreaInterest/modal";
import TopicSelection from "../AreaInterest/topicSelect";
import CustomToast from "../Other/Toast";
import GraphResolvers from "_apiGraphStrings/index";
// import { addAreasOfInterest } from "lib/apollo/apolloFunctions/mutations";

interface NewUserModal {
  onOpen: () => void;
  onClose: () => void;
  isOpen: boolean;
  userId: string;
}

const NewUserModal = ({ onOpen, onClose, isOpen, userId }: NewUserModal) => {
  const toast = useToast();
  const [selected, setSelected] = useState<Selected[]>([]);
  const [disableSave, setDisableSave] = useState(false);

  const [addAreas, { loading: areasLoading }] = useMutation(
    GraphResolvers.mutations.ADD_AREAS_INTEREST
  );

  const handleSubmit = async () => {
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
      toast({
        id: "areaAdded",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Areas of Interest Updated"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });
      onClose();
    } catch (err) {
      toast({
        id: "areaAddErr",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Something went wrong!  Please refresh page and try again."}
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        closeOnOverlayClick={false}
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader color="poldit.100" alignSelf={"center"}>
            Welcome to Poldit!
          </ModalHeader>
          <Text color="gray.500" pl="5">
            Before you start asking questions, giving answers and providing your
            own knowledge on varios subjects, please select at least 3 topics
            and their corresponding subtopics that may interest you.
          </Text>
          <Spacer />
          <ModalBody>
            <AreasInterestModal
              areas={[]}
              selected={selected}
              setSelected={setSelected}
            />
          </ModalBody>
          <Flex flexDirection={"column"} mt="5">
            <Button
              colorScheme="blue"
              alignSelf={"center"}
              w="50%"
              m="2"
              mt="3"
              isLoading={areasLoading}
              onClick={handleSubmit}
              borderColor="poldit.100"
              disabled={selected.length < 3}
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
        </ModalContent>
      </Modal>
    </>
  );
};

// const NewUserModal = ({ onOpen, onClose, isOpen, userId }: NewUserModal) => {
//   return (
//     <>
//       <Modal
//         isOpen={isOpen}
//         onClose={onClose}
//         size="2xl"
//         closeOnOverlayClick={false}
//       >
//         <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
//         <ModalContent>
//           <ModalHeader color="poldit.100" alignSelf={"center"}>
//             Welcome to Poldit!
//           </ModalHeader>
//           <Text color="gray.500" pl="5">
//             Before you start asking questions, giving answers and providing your
//             own knowledge on varios subjects, please select at least 3 topics
//             that may interest you.
//           </Text>
//           <Spacer />
//           <ModalBody>
//             <TopicSelection onClose={onClose} userId={userId} />
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

export default NewUserModal;
