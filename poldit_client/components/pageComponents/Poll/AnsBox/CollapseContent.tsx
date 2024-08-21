import { Box, Text, useDisclosure, Collapse, Image } from "@chakra-ui/react";
import React, { useState } from "react";
import { PhotoConsumer, PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/index.css";

interface CollapseContent {
  answer: string;
  image: string;
}

const CollapseContent = ({ answer, image }: CollapseContent) => {
  const { isOpen, onToggle } = useDisclosure();
  const [showShortAns, setShowShortAns] = useState<boolean>(true);

  const showFullAns = () => {
    setShowShortAns(!showShortAns);
    onToggle();
  };

  return (
    <Box pt={5} pb={1} px={5}>
      <Text fontSize="sm" noOfLines={showShortAns ? 2 : 0}>
        {answer}
      </Text>
      {(answer.length > 140 || image) && (
        <Text
          onClick={showFullAns}
          fontSize="xs"
          cursor="pointer"
          color="blue.400"
        >
          {isOpen ? "Show less" : "Show more"}
        </Text>
      )}
      {true && (
        <Collapse in={isOpen} animateOpacity>
          <PhotoProvider>
            <PhotoConsumer src={image as string}>
              <Box
                mt={4}
                w="50%"
                h="100%"
                textAlign="center"
                cursor="pointer"
                borderRadius="md"
                overflow="hidden"
              >
                <Image
                  src={image}
                  objectFit="cover"
                  objectPosition="center center"
                  cursor="pointer"
                  // h="50%"
                  w="100%"
                />
              </Box>
            </PhotoConsumer>
          </PhotoProvider>
          {/* <ReactPlayer
              url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
              height="260px"
              width="100%"
              controls={true}
            /> */}
        </Collapse>
      )}
    </Box>
  );
};

export default CollapseContent;
