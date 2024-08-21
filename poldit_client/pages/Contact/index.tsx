import { useMutation } from "@apollo/client";
import {
  Box,
  Container,
  Flex,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Button,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { getFormData } from "_components/formFuncs/miscFuncs";
import Layout from "_components/layout/Layout";
import Metadata from "_components/pageComponents/Other/Metadata";
import CustomToast from "_components/pageComponents/Other/Toast";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";

const ContactUs = () => {
  const toast = useToast();
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [contactUs] = useMutation(GraphResolvers.mutations.CONTACT_POLDIT);

  const handleMsgChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMsg(e.target.value);
  };

  const clearForm = () => {
    (document.getElementById("contactUs") as HTMLFormElement).reset();
    setMsg("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDetails: { oldPw: string; newPw: string; confirmNewPw: string } =
      getFormData("contactUs");

    try {
      await contactUs({ variables: { details: JSON.stringify(formDetails) } });

      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Message submitted.  Thanks for your feedback"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });

      router.push("/");
    } catch (err: any) {
      const errMssg =
        (err.message as string).search("inappropriate language") > -1
          ? err.message
          : "Something went wrong.  Please refresh the page and try again.";

      toast({
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={errMssg}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  };

  return (
    <Layout>
      <Metadata title="Contact Us" />
      <Container
      w={{sm: "container.sm", md: "container.lg", lg: "container.xl"}}
        // maxW={"container.md"}
        aria-label="container"
        mt="10"
        rounded={"md"}
        bg="white"
        p="10"
      >
        <Heading textAlign="center" color="poldit.100" fontWeight={"semibold"}>
          Contact Us
        </Heading>

        <Text mt="8" color="gray.400" fontSize={"15px"}>Got any feedback, issues or cool Ideas? Let us know!</Text>

        <form onSubmit={handleSubmit} id="contactUs">
          <Stack spacing="6" mt="5">
            <FormControl isRequired>
              <FormLabel htmlFor="firstName" color="gray.600" ml="1">
                Full Name
              </FormLabel>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Full Name"
                isRequired
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="email" color="gray.600" ml="1">
                Email
              </FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                isRequired
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="firstName" color="gray.600" ml="1">
                Phone Number
              </FormLabel>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="number"
                placeholder="Phone Number"
              />
            </FormControl>
          </Stack>
          <Flex mt="10">
            <FormControl isRequired>
              <Flex align={"center"} justifyContent="space-between">
                <FormLabel htmlFor="aboutme" ml="1">
                  Message
                </FormLabel>
                <FormLabel color="gray.500" fontSize="sm" mr="1">
                  {msg.length}/400
                </FormLabel>
              </Flex>
              <Textarea
                id="mssg"
                name="aboutMe"
                borderColor="gray.300"
                value={msg}
                onChange={handleMsgChange}
                maxLength={400}
                height="300px"
                placeholder="Please provide feedback or ask any questions regarding the site"
              />
            </FormControl>
          </Flex>
          <HStack justify={"flex-end"} mt="8" spacing={"5"}>
            <Button
              borderColor="gray.500"
              borderWidth="1px"
              bg="white"
              color="gray.500"
              _hover={{ bg: "gray.500", color: "white" }}
              _active={{ bg: "gray.500", color: "white" }}
              _focus={{ outline: "none" }}
              onClick={clearForm}
            >
              Cancel
            </Button>
            <Button
              borderColor="poldit.100"
              borderWidth="1px"
              bg="poldit.100"
              color="white"
              _hover={{ bg: "poldit.100", color: "white" }}
              _active={{ bg: "white", color: "poldit.100" }}
              _focus={{ outline: "none" }}
              type="submit"
            >
              Submit
            </Button>
          </HStack>
        </form>
      </Container>
    </Layout>
  );
};

export default ContactUs;
