import { Box, useDisclosure, Button, HStack, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";

const Drawer = (props: any) => {
  return (
    <motion.div
      {...props.getDisclosureProps()}
      hidden={props.hidden}
      initial={false}
      // onAnimationStart={() => props.handleAnim(props.contentType, false)}
      // onAnimationComplete={() => props.handleAnim(props.contentType, !props.isOpen)}
      onAnimationStart={() => props.setHidden(false)}
      onAnimationComplete={() => props.setHidden(!props.isOpen)}
      animate={{
        position: "absolute",
        zIndex: props.depth ?? 10,
        left: props.type === "left" ? 0 : undefined,
        right: props.type === "right" ? 0 : undefined,
        bottom: 0,
        // bottom: props.isOpen ? props.height : 0,
        width: props.isOpen ? props.width : 0,
        height: props.isOpen ? props.height : 0,
      }}
      style={props.style}
    >
      {props.children}
    </motion.div>
  );
};

export default Drawer;
