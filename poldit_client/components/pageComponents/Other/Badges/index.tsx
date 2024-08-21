import { Box, Flex, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import styles from "./badge.module.css";

interface IBadgeProps {
  children: ReactNode;
  ctrStyles: any;
}

export const CircleBadge = ({ children, ctrStyles }: IBadgeProps) => {
  return (
    <div className={`${styles.circleBadge}`} style={ctrStyles}>
      <span>{children}</span>
    </div>
    // <Flex
    //   {...ctrStyles}
    //   justifyContent={"center"}
    //   alignItems="center"
    //   //   textAlign={"center"}
    //   borderRadius="50%"
    //   style={{
    //     boxSizing: "content-box",
    //     width: "2em",
    //     height: "2em",
    //     lineHeight: "2em",
    //   }}
    // >
    //   {children}
    // </Flex>
  );
};
