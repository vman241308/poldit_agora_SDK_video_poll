import { Box, Flex, Container, Image, Text } from "@chakra-ui/react";
import { PoldItNavBtn } from "../Other/Button/brandedItems";

interface ErrorPage {
  errMssg: string;
}

const ErrorPage = ({ errMssg }: ErrorPage) => (
  <Flex bg="gray.200" minH="100vh" align="center" justify="center">
    <Container
      maxW={"2xl"}
      centerContent
      px={{ base: 8, sm: 14 }}
      p="6"
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
        color={"gray.500"}
        mb={"5"}
      >
        {errMssg}
      </Text>
      <Box mt="6">
        <PoldItNavBtn link="/Login" btnLabel="Log In" />
      </Box>
    </Container>
  </Flex>
);
export default ErrorPage;
