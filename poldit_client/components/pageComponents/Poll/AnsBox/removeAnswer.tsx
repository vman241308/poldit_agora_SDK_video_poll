import { useMutation } from "@apollo/client";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  Button,
  Text,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { removeAnswer_updateLimits } from "lib/apollo/apolloFunctions/mutations";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import CustomToast from "_components/pageComponents/Other/Toast";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";

interface RemoveAns {
  isOpen: boolean;
  close: () => void;
  answerId: string;
  pollId: string;
}

const RemoveAnsModal = ({ isOpen, close, answerId, pollId }: RemoveAns) => {
  const toast = useToast();

  const [removeAnswer] = useMutation(GraphResolvers.mutations.REMOVE_ANSWER);

  const handleRemove = async () => {
    try {
      await removeAnswer_updateLimits(removeAnswer, answerId, pollId);
      // await removeAnswer({ variables: { answerId } });

      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Answer removed!"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });
      close();
    } catch (err) {
      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Something went wrong.  Unable to remove answer!"}
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
    <Modal isOpen={isOpen} onClose={close} isCentered size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Stack spacing="3">
            <Text>Are you sure you want to delete your answer?</Text>
            <Flex justify={"center"} alignItems="center">
              <Button
                mr="6"
                variant="outline"
                size="sm"
                w="80px"
                color="poldit.100"
                borderColor="poldit.100"
                _hover={{ bg: "poldit.100", color: "white" }}
                _active={{ outline: "none" }}
                _focus={{ outline: "none" }}
                onClick={handleRemove}
              >
                Yes
              </Button>
              <Button
                size="sm"
                variant="outline"
                color="gray.500"
                w="80px"
                borderColor={"gray.800"}
                _active={{ outline: "none" }}
                _focus={{ outline: "none" }}
                onClick={close}
              >
                Cancel
              </Button>
            </Flex>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RemoveAnsModal;
