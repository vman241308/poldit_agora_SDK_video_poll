import { Box, useDisclosure, Button, HStack, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";

export const AnimatedBox = (props: any) => {
  return (
    <Flex>
      <motion.div
        layout
        {...props.getDisclosureProps()}
        hidden={props.hidden}
        initial={false}
        onAnimationStart={() => props.setHidden(false)}
        onAnimationComplete={() => props.setHidden(!props.isOpen)}
        animate={props.animationProps}
        transition={props.transitionProps}
        // animate={{
        //   position: "absolute",
        //   zIndex: 10,
        //   left: props.type === "left" ? 0 : undefined,
        //   right: props.type === "right" ? 0 : undefined,
        //   bottom: 0,
        //   // bottom: props.isOpen ? props.height : 0,
        //   width: props.isOpen ? props.width : 0,
        //   height: props.isOpen ? props.height : 0,
        // }}
        style={props.style}
      >
        {props.children}
      </motion.div>
    </Flex>
  );
};
