import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Image,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

export const LightBoxImage = ({ url, lbOpen, onLbClose }: any) => {
  return (
    <Modal isOpen={lbOpen} onClose={onLbClose}>
      <ModalOverlay />
      <ModalContent w={{ base: "90%", md: "70%" }}>
        <ModalBody p="0">
          <Box textAlign="center">
            <Image src={url} w="100%" />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
