import { Box } from "@chakra-ui/react";
import React from "react";
import styles from "./loading.module.css";

interface Props {
  btnStyles: any;
}

function ThreeDotsLoading({ btnStyles }: Props) {
  return (
    <div className={`${styles.bouncingLoader}`}>
      <div style={btnStyles}></div>
      <div style={btnStyles}></div>
      <div style={btnStyles}></div>
    </div>
  );
}

export default ThreeDotsLoading;
