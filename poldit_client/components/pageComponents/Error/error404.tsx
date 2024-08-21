import { Box, Flex, Text, Container } from "@chakra-ui/layout";
import { Button, Image } from "@chakra-ui/react";
import { PoldItNavBtn } from "_components/pageComponents/Other/Button/brandedItems";

const Custom404 = () => {
  return (
    <Flex bg="gray.200" minH="100vh" align="center" justify="center">
      {/* <Image src="https://res.cloudinary.com/poldit/image/upload/v1642107440/PoldIt/App_Imgs/Website-construction.jpg_mhboir.webp" /> */}
      <Container
        maxW={"2xl"}
        centerContent
        px={{ base: 8, sm: 14 }}
        p="6"
        // pb="16"
        // pt="6"
        mb="20"
        bgGradient="linear(to-br, white, orange.50)"
        borderRadius="lg"
        boxShadow="lg"
      >
        <Flex justify="center">
          <Image
            src="https://res.cloudinary.com/rahmad12/image/upload/v1624921500/PoldIt/App_Imgs/PoldIt_logo_only_agkhlf.png"
            w="140px"
            cursor="pointer"
          />
        </Flex>
        <Text
          fontSize={"large"}
          fontWeight={"semibold"}
          color={"poldit.100"}
          mb={"5"}
        >
          Oops! Something went wrong.
        </Text>
        <Text>There is an issue with the current page.</Text>
        <Box mt="6">
          <PoldItNavBtn link="/" btnLabel="Go Back Home" />
        </Box>
      </Container>
    </Flex>
  );
};

export default Custom404;