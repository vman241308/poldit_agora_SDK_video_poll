import { useRouter } from "next/router";
import React from "react";
import { Box, Flex, Image, Stack } from "@chakra-ui/react";
import { VerifyEmailBtn } from "_components/pageComponents/Registration/verification";

export function getServerSideProps(context: any) {
  return {
    props: { params: context.params },
  };
}

const EmailVerification = ({ params }: any) => {
  const router = useRouter();

  return (
    <Box minH="100vh" h="100vh" bg="gray.200">
      <Flex align="center" justify="center" minH="100vh">
        <Box
          px={{ base: 8, sm: 14 }}
          pb="16"
          pt="6"
          mb="20"
          bgGradient="linear(to-br, white, orange.50)"
          borderRadius="lg"
          boxShadow="lg"
        >
          <Stack>
            <Flex justify="center">
              <Image
                src="https://res.cloudinary.com/rahmad12/image/upload/v1624921500/PoldIt/App_Imgs/PoldIt_logo_only_agkhlf.png"
                w="140px"
                cursor="pointer"
              />
            </Flex>
            <Box pb="5">
              Please verify your email by clicking on the button below.
            </Box>
            <VerifyEmailBtn token={params.token} />
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default EmailVerification;
