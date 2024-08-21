import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

interface ILogInModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function LogInModal({ isOpen, onOpen, onClose }: ILogInModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size={"xl"}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent p="5">
        <ModalHeader color="poldit.100" alignSelf={"center"}>
          You are not logged in!
        </ModalHeader>
        <ModalBody color="gray.500">
          To view the content on this poll and others, please click the button
          below to register or log in so you can create and answer polls, see
          who's online, and chat with the community!
        </ModalBody>
        <ModalFooter flex={1} alignItems="center" justifyContent={"center"}>
          <Link href="/Login">
            <Button
              variant="outline"
              color="#ff4d00"
              borderColor="#ff4d00"
              w="50%"
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
              onClick={onClose}
              //   size="sm"
            >
              Register/Log In
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default LogInModal;
