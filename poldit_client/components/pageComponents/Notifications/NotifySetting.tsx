import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

export const NotifySetting = ({ isOpen, onClose }: any) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Notification Setting</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>This is Notification settings</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
