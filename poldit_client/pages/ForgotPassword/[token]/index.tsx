import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverTrigger,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { RiLockPasswordFill } from "react-icons/ri";
import { useRouter } from "next/router";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible, AiOutlineLock } from "react-icons/ai";
import { ErrorMssg } from "_components/appTypes/appType";
import ErrorForm, {
  MobileErrorForm,
} from "_components/pageComponents/Error/formErrors";
import { newPwErrors } from "_components/appData";
import { BsCheck } from "react-icons/bs";
import { BiErrorCircle } from "react-icons/bi";
import { checkPWText } from "_components/formFuncs/miscFuncs";

const ForgotPassword = (props: {}) => {
  const router = useRouter();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userFound, setuserFound] = useState(false);
  const [errors, setErrors] = useState(newPwErrors);
  const [newPw, setNewPw] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [updateUserPassword, { loading }] = useMutation(
    GraphResolvers.mutations.UPDATE_USER_PASSWORD
  );

  let onSubmit = (e: any) => {
    e.preventDefault();

    const errors: ErrorMssg[] = [];

    const resp = document.getElementsByTagName("form")[0];

    const pw1: string = resp.password.value;
    const pw2: string = resp.password2.value;

    if (pw2.length === 0) {
      errors.push({
        type: "pw error",
        message: "Please confirm your new password.",
      });
    }

    if (pw1.length < 8 || pw2.length < 8) {
      errors.push({
        type: "pw error",
        message: "The password has to be a minimum of 8 characters.",
      });
    }

    if (pw1 !== pw2) {
      errors.push({
        type: "pw error",
        message:
          "The passwords do not match.  Please provide the same password in both password fields.",
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
      updateUserPassword({
        variables: { token: router.query.token, password: pw1 },
        onCompleted: (res) =>
          toast({
            title: res.updateUserPassword,
            status: "success",
            isClosable: true,
            duration: 4000,
          }),
      });
    } catch (err: any) {
      toast({
        title: err.message,
        status: "error",
        isClosable: true,
        duration: 3000,
      });
    }
    router.push("/Login");
  };

  const handleMobile = (windowWidth: number) => {
    if (windowWidth <= 1000) {
      setIsMobile(true);
      return;
    }

    setIsMobile(false);
  };

  const getWindowDimensions = () => {
    if (typeof window !== "undefined") {
      const browserWidth = window.innerWidth;

      handleMobile(browserWidth);
    }
  };

  useEffect(() => {
    handleMobile(window.innerWidth);

    window.addEventListener("resize", getWindowDimensions);

    return () => window.removeEventListener("resize", getWindowDimensions);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPw(e.target.value);

    const updatedErrors = checkPWText(e.target.value, errors);
    setErrors(updatedErrors);
  };

  const newPwChcksPassed = errors?.every((item) => !item.errMatch);

  return (
    <Box minH="100vh" h="100vh" bg="gray.200">
      <Flex align="center" justify="center" minH="100vh">
        <Box
          maxW="400px"
          bg="white"
          px={[6, 6, 12]}
          mx={[4, 4, 0]}
          py="12"
          border="1px solid #F4F4F4"
          boxShadow="0px 4px 7px rgba(0, 0, 0, 0.07)"
          borderRadius="lg"
          mb="20"
        >
          <Flex justify="center">
            <RiLockPasswordFill size="72" color="gray" />
          </Flex>
          <Box>
            <Text fontWeight="bold" fontSize="xl" textAlign="center" mb="2">
              Forgot Password?
            </Text>
            <Text color="gray.500" fontSize="md" textAlign="center">
              Please enter your new password below so you can access the site.
            </Text>
          </Box>
          <Box mt="6">
            <form onSubmit={onSubmit}>
              <Stack spacing={5}>
                <FormControl>
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
                      <InputLeftElement
                        pointerEvents="none"
                        children={<AiOutlineLock />}
                      />
                      <Input
                        id="password"
                        name="password"
                        type={show ? "text" : "password"}
                        placeholder="Password"
                        minLength={8}
                        // minW={{ base: "100px", sm: "320px" }}
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
                            onClick={() => setShow(!show)}
                            icon={show ? <AiFillEye /> : <AiFillEyeInvisible />}
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
                {isMobile && !newPwChcksPassed && (
                  <Box
                    mt="4"
                    mb="4"
                    w="100%"
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
                  </Box>
                )}
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<AiOutlineLock />}
                  />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    name="password2"
                    required
                  />
                  <InputRightElement>
                    <IconButton
                      _hover={{ bg: "none" }}
                      _focus={{ outline: "none" }}
                      _active={{ bg: "none" }}
                      variant="ghost"
                      aria-label="showHide"
                      onClick={() => setShowConfirm(!showConfirm)}
                      icon={
                        showConfirm ? <AiFillEye /> : <AiFillEyeInvisible />
                      }
                    />
                  </InputRightElement>
                </InputGroup>
              </Stack>
              <Box mt="4">
                <Button
                  w="100%"
                  bg="poldit.100"
                  color="white"
                  px="10"
                  type="submit"
                  _hover={{
                    bg: "orange.300",
                  }}
                  _focus={{
                    outline: "none",
                  }}
                  _active={{
                    bg: "poldit.100",
                  }}
                >
                  Submit
                </Button>
              </Box>
            </form>
            <Box mt="2">
              <Button
                w="100%"
                bg="gray.400"
                border="2px"
                borderColor="gray.400"
                color="white"
                px="10"
                _hover={{
                  bg: "gray.400",
                  color: "white",
                }}
                _focus={{
                  outline: "none",
                }}
                _active={{
                  bg: "white",
                  color: "gray.500",
                }}
                onClick={() => router.push("/Login")}
              >
                Go Back
              </Button>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default ForgotPassword;
