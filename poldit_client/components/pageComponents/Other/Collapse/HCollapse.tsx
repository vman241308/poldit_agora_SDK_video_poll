import { Box, useDisclosure, Button, HStack, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChatReactBar_Selected } from "_components/pageComponents/Poll/ChatBox/ChatReactBar";

const HCollapse = (props: any) => {
  return (
    <Flex alignItems={"center"}>
      <Button
        {...props.btnStyle}
        {...props.getButtonProps()}
        variant="unstyled"
        _focus={{ outline: "none" }}
        _hover={{ outline: "none", color: props.hoverColor ?? "blue.500" }}
      >
        React
      </Button>
      {!props.isOpen && (
        <Box ml="-1">
          <ChatReactBar_Selected data={props.data} txtColor={props.txtColor} />
        </Box>
      )}

      <motion.div
        {...props.getDisclosureProps()}
        hidden={props.hidden}
        initial={false}
        onAnimationStart={() => props.setHidden(false)}
        onAnimationComplete={() => props.setHidden(!props.isOpen)}
        animate={{ width: props.isOpen ? 230 : 0 }}
        style={props.style}
      >
        {props.children}
      </motion.div>
    </Flex>
  );
};

export default HCollapse;
