import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { ErrorMssg } from "../../components/appTypes/appType";
import { errorHandling } from "../../components/formFuncs/errorFuncs";

import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  Popover,
  PopoverTrigger,
  Select,
  Stack,
  Text,
  useDisclosure,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";

import GraphResolvers from "../../lib/apollo/apiGraphStrings/index";
import LegalAgmt from "_components/pageComponents/Registration/legal";
import { monthList, getYear, newPwErrors } from "../../components/appData";
import { BsCheck } from "react-icons/bs";
import { BiErrorCircle } from "react-icons/bi";
import ErrorForm, {
  MobileErrorForm,
} from "_components/pageComponents/Error/formErrors";
import { checkPWText } from "_components/formFuncs/miscFuncs";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Metadata from "_components/pageComponents/Other/Metadata";
import Cookies from "js-cookie";

const Registration = (props: {}) => {
  const toast = useToast();
  const [errors, setErrors] = useState(newPwErrors);
  const [newPw, setNewPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [isMobile] = useMediaQuery("(max-width: 1240px)");

  let month = monthList;

  const [createUser, { loading, error }] = useMutation(
    GraphResolvers.mutations.CREATE_USER
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPw(e.target.value);

    const updatedErrors = checkPWText(e.target.value, errors);
    setErrors(updatedErrors);
  };

  const onSignupSubmit = async (e: any) => {
    e.preventDefault();

    let { formObj } = errorHandling();

    const errors: ErrorMssg[] = [];

    if (
      formObj.email.search(".com") === -1 &&
      formObj.email.search(".net") === -1
    ) {
      errors.push({
        type: "email error",
        message: `${formObj.email} is not a valid email address.`,
      });
    }

    if (formObj.password.length < 8) {
      errors.push({
        type: "pw error",
        message: "The password has to be a minimum of 8 characters.",
      });
    }

    if (formObj.password !== formObj.password2) {
      errors.push({
        type: "pw error",
        message:
          "The passwords do not match.  Please provide the same password in both password fields",
      });
    }

    if (formObj.appid.search("@") > -1 || formObj.appid === formObj.email) {
      errors.push({
        type: "username error",
        message:
          "Your username cannot be the same as your email address or contain the @ character.  Please provide a different username.",
      });
    }

    if (!newPwChcksPassed) {
      errors.push({
        type: "pw error",
        message:
          "Your password doesnt meet all the requirements.  Please update the password to meet all criteria on the checklist.",
      });
    }

    if (errors.length > 0) {
      errors.forEach((err) => {
        toast({
          title: err.message,
          status: "error",
          isClosable: true,
          duration: 3000,
        });
      });
      return;
    }

    try {
      const user = await createUser({
        variables: { formInputs: JSON.stringify(formObj) },
        onCompleted: (res) => {
          toast({
            title:
              "Successfully Registered.  Please check your inbox to verify your email to complete registration.",
            status: "success",
            isClosable: true,
            duration: 4000,
          });
        },
      });

      user && router.push("/Login");
    } catch (err: any) {
      // if (err.message.search("duplicate key")) {
      //   toast({
      //     title: "Username already exists.",
      //     status: "error",
      //     isClosable: true,
      //     duration: 3000,
      //   });
      //   return;
      // }
      toast({
        title: err.message,
        status: "error",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const newPwChcksPassed = errors.every((item) => !item.errMatch);

  return (
    <Box
      minH="100vh"
      bg="gray.200"
      // bg="gray.200"
    >
      <Metadata title="Poldit Registration" />
      <Flex align="center" justify="center" minH="100vh">
        <Box
          px={{ base: 6, sm: 14 }}
          pb="16"
          pt="6"
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
          <form onSubmit={onSignupSubmit} id="regForm">
            <Stack spacing="6" direction={{ base: "column", md: "row" }}>
              <FormControl>
                <FormLabel htmlFor="firstName" color="gray.600">
                  First Name
                </FormLabel>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  minW={{ base: "100px", sm: "320px" }}
                  isRequired
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="lastName" color="gray.600">
                  Last Name
                </FormLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  minW={{ base: "100px", sm: "320px" }}
                  isRequired
                />
              </FormControl>
            </Stack>
            <Stack spacing="6" direction={{ base: "column", md: "row" }} mt="6">
              <FormControl>
                <FormLabel htmlFor="email" color="gray.600">
                  Email
                </FormLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  minW={{ base: "100px", sm: "320px" }}
                  isRequired
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="username" color="gray.600">
                  Username
                </FormLabel>
                <Input
                  id="appid"
                  name="username"
                  type="text"
                  placeholder="username"
                  minW={{ base: "100px", sm: "320px" }}
                  isRequired
                  maxLength={14}
                />
              </FormControl>
            </Stack>
            <Stack spacing="6" direction={{ base: "column", md: "row" }} mt="6">
              <FormControl>
                <FormLabel htmlFor="password" color="gray.600">
                  Password
                </FormLabel>
                <HStack spacing={"0"}>
                  {!isMobile && (
                    <Popover placement="left" isOpen={!newPwChcksPassed}>
                      <PopoverTrigger>
                        <Box />
                      </PopoverTrigger>
                      <ErrorForm errs={errors} marginRight="5" />
                    </Popover>
                  )}

                  <InputGroup>
                    <Input
                      id="password"
                      name="password"
                      type={showNew ? "text" : "password"}
                      placeholder="Password"
                      minLength={8}
                      minW={{ base: "100px", sm: "320px" }}
                      isRequired
                      onChange={handleInputChange}
                    />
                    <InputRightElement mr="3">
                      <HStack spacing={"-2"}>
                        <IconButton
                          _hover={{ bg: "none" }}
                          _focus={{ outline: "none" }}
                          _active={{ bg: "none" }}
                          variant="ghost"
                          aria-label="showHide"
                          onClick={() => setShowNew(!showNew)}
                          icon={
                            showNew ? <AiFillEye /> : <AiFillEyeInvisible />
                          }
                        />
                        <IconButton
                          aria-label="share"
                          variant="ghost"
                          fontSize={"15px"}
                          icon={
                            newPwChcksPassed ? <BsCheck /> : <BiErrorCircle />
                          }
                          bg="none"
                          color={newPwChcksPassed ? "green.500" : "red.500"}
                          isRound={true}
                          _hover={{ bg: "none" }}
                          _focus={{ outline: "none" }}
                          _active={{ bg: "none" }}
                          size="xs"
                        />
                      </HStack>
                    </InputRightElement>
                  </InputGroup>
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password2" color="gray.600">
                  Retype Password
                </FormLabel>
                <InputGroup>
                  <Input
                    id="password2"
                    name="password2"
                    type={showNew ? "text" : "password"}
                    placeholder="Password"
                    minW={{ base: "100px", sm: "320px" }}
                    isRequired
                  />
                  <InputRightElement>
                    <IconButton
                      _hover={{ bg: "none" }}
                      _focus={{ outline: "none" }}
                      _active={{ bg: "none" }}
                      variant="ghost"
                      aria-label="showHide"
                      onClick={() => setShowNew(!showNew)}
                      icon={showNew ? <AiFillEye /> : <AiFillEyeInvisible />}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </Stack>
            {isMobile && !newPwChcksPassed && (
              <Flex
                mt="4"
                mb="4"
                bg="gray.100"
                // border="1px"
                rounded={"md"}
                // borderColor="gray.300"
                justifyContent={"center"}
                pt="3"
                pb="3"
                p="2"
              >
                <MobileErrorForm errs={errors} />
              </Flex>
            )}
            <Box mt="3" ml="1">
              <Text color="gray.700">Birthday</Text>
            </Box>
            <Stack spacing="6" direction={{ base: "column", md: "row" }} mt="2">
              <Select id="bday_month" isRequired>
                <option value="" hidden>
                  Month
                </option>
                {month.map((x) => (
                  <option value={x} key={x}>
                    {x}
                  </option>
                ))}
              </Select>
              <Select id="bday_day" isRequired>
                <option value="" hidden>
                  Day
                </option>
                {Array.from(Array(31).keys()).map((x) => (
                  <option value={x + 1} key={x}>
                    {x + 1}
                  </option>
                ))}
              </Select>
              <Select id="bday_year" isRequired>
                <option value="" hidden>
                  Year
                </option>
                {getYear().map((x) => (
                  <option value={x} key={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </Stack>

            <Box mt="6" fontSize="sm" color="gray.500">
              By registering, you agree to our{" "}
              <a
                style={{
                  color: "blue",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={onOpen}
              >
                terms and conditions
              </a>{" "}
              and{" "}
              <a
                style={{
                  color: "blue",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                privacy policy.
              </a>
              <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
                <ModalOverlay bgColor={"gray.200"} />
                <LegalAgmt close={onClose} />
              </Modal>
            </Box>

            {/* <Box mt="6">
              <Checkbox color="gray.600" id="useragreementagreed" isRequired>
                <HStack spacing={"1"}>
                  <Text>I agree to the terms & conditions of the</Text>
                  <Text fontWeight={"semibold"} color={"blue"} onClick={onOpen}>
                    User Agreement
                  </Text>
                </HStack>
              </Checkbox>
              <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
                <ModalOverlay bgColor={"gray.200"} />
                <LegalAgmt close={onClose} />
              </Modal>
            </Box> */}
            <Box mt="5">
              <Button
                w="100%"
                _focus={{ outline: "none" }}
                borderRadius="md"
                color="white"
                //bgGradient="linear(to-l, poldit.100 , orange.300  )"
                bg="poldit.100"
                _hover={{ bg: "orange.300" }}
                _active={{
                  bg: "poldit.100",
                }}
                type="submit"
              >
                Register
              </Button>
            </Box>
          </form>
          <Box mt="3">
            <Text fontSize="sm" color="gray.500">
              Already have an account?{" "}
              <Text
                as="span"
                color="blue.400"
                cursor="pointer"
                onClick={() => router.push("/Login")}
              >
                Login here.
              </Text>
            </Text>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Registration;
