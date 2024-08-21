import {
  Box,
  Text,
  Button,
  Stack,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Container,
  CloseButton,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "_components/layout/Layout";

const Privacy = () => {
  const [content, setContent] = useState("");

  const router = useRouter();

  const fetchData = async () => {
    try {
      const data = await (
        await fetch(
          "https://res.cloudinary.com/poldit/raw/upload/v1650461170/PoldIt/Docs/Poldit_Privacy_Policy_Final_fwqyca.htm"
        )
      ).text();

      setContent(data);
    } catch (err) {
      setContent("Privacy Policy unable to load.  Please try again later.");
    }
  };

  const goToPage = () => router.back();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <Container maxW={"3xl"} mt="10" pb="10">
        {!content ? (
          <Flex h="70vh" justifyContent={"center"} alignItems="center">
            <Spinner color="poldit.100" size="lg" />
          </Flex>
        ) : (
          <Stack
            spacing={"8"}
            bg="white"
            rounded="md"
            px={{ base: 6, sm: 14 }}
            pb="10"
            pt="6"
            position="relative"
          >
            <CloseButton
              position={"absolute"}
              right="5"
              top="5"
              onClick={goToPage}
              variant="ghost"
              _active={{ outline: "none" }}
              _focus={{ outline: "none" }}
            />
            <Box dangerouslySetInnerHTML={{ __html: content }} fontSize="sm" />

            <Button
              variant="solid"
              colorScheme="gray"
              onClick={goToPage}
              _active={{ outline: "none" }}
              _focus={{ outline: "none" }}
            >
              Close
            </Button>
          </Stack>
        )}
      </Container>
    </Layout>
  );
};

export default Privacy;
