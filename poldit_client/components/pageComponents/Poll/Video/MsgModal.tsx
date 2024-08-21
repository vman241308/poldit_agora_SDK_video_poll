import React from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Box,
  ModalFooter,
  HStack,
  Button,
} from "@chakra-ui/react";

import { capitalizeWord } from "_components/globalFuncs";
import { User } from "_components/appTypes/appType";
import { IUserPresence } from "_components/hooks/channel/useChannel";

interface IMssgModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserPresence | User;
  title: string;
  mssg?: string;
  handler: any;
  //   creator: string;
  //   handleAnswer: (answer: boolean) => void;
}

const MsgModal = ({
  isOpen,
  onClose,
  user,
  title,
  mssg,
  handler,
}: IMssgModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent textAlign={"start"}>
        <ModalHeader color="poldit.100" alignSelf={"center"}>
          {title}
          {/* {`${capitalizeWord(user.appid)} is trying to share their screen.`} */}
        </ModalHeader>
        {mssg && (
          <ModalBody color="gray.500">
            {mssg}
            {/* {`If you accept, ${user.appid}'s screen will replace any screen currently being shared.`} */}
          </ModalBody>
        )}
        <ModalFooter flex={1} alignItems="center" justifyContent={"center"}>
          <HStack w="100%">
            <Button
              variant="outline"
              color="#ff4d00"
              borderColor="#ff4d00"
              w="50%"
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
              onClick={() => handler(true)}
              //   size="sm"
            >
              Accept
            </Button>
            <Button colorScheme={"red"} w="50%" onClick={() => handler(false)}>
              Decline
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MsgModal;
