import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Stack,
  useToast,
  Text,
  useDisclosure,
  Popover,
  PopoverTrigger,
  HStack,
  Tooltip,
  useMediaQuery,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AiFillEye, AiFillEyeInvisible, AiOutlineLock } from "react-icons/ai";
import { BiErrorCircle } from "react-icons/bi";
import { BsCheck } from "react-icons/bs";
// import GraphResolvers from "_apiGraphStrings/index.tsx";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { checkPWText, getFormData } from "_components/formFuncs/miscFuncs";
import ErrorForm, { MobileErrorForm } from "../Error/formErrors";
import { useMutation } from "@apollo/client";
import { newPwErrors } from "_components/appData";

interface ChangePW {
  close: () => void;
}

const ChangePW = ({ close }: ChangePW) => {
  const toast = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState(newPwErrors);
  const [isMobile] = useMediaQuery("(max-width: 1240px)");

  const [newPw, setNewPw] = useState("");

  const [changePw] = useMutation(GraphResolvers.mutations.CHANGE_PW);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPw(e.target.value);

    const updatedErrors = checkPWText(e.target.value, errors);
    setErrors(updatedErrors);
  };

  const resetForm = () => {
    setErrors(newPwErrors);
    (document.getElementById("changePw") as HTMLFormElement).reset();
    setNewPw("");
    close();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const regex = /"~!@#\$%\^\*-_=\+\[\{]\}\/;:,\.\?"/i;
    const formDetails: { oldPw: string; newPw: string; confirmNewPw: string } =
      getFormData("changePw");

    if (formDetails.newPw !== formDetails.confirmNewPw) {
      toast({
        title:
          "The passwords do not match.  Please provide the same password in both new password fields.",
        status: "error",
        isClosable: true,
        duration: 2000,
      });
      return;
    }

    if (!newPwChcksPassed) {
      toast({
        title:
          "Your password doesnt meet all the requirements.  Please update the password to meet all criteria on the checklist.",
        status: "error",
        isClosable: true,
        duration: 2000,
      });
      return;
    }

    try {
      const data: any = await changePw({
        variables: { oldPw: formDetails.oldPw, newPw: formDetails.newPw },
      });

      toast({
        title: "Password changed successfully!",
        status: "success",
        isClosable: true,
        duration: 3000,
      });

      close();
    } catch (err: any) {
      toast({
        title: err.message,
        status: "error",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const newPwChcksPassed = errors?.every((item) => !item.errMatch);

  return (
    <>
      <ModalContent>
        <ModalHeader fontWeight="semibold">Change Password</ModalHeader>
        <ModalCloseButton
          _active={{ outline: "none", bg: "none" }}
          _focus={{ outline: "none", bg: "none" }}
          _hover={{ bg: "gray.300", color: "white" }}
        />
        <ModalBody>
          <form id="changePw" onSubmit={handleSubmit}>
            <Flex
              flexDirection={"column"}
              justifyContent={"space-between"}
              //   h="250px"
            >
              <Flex
                flexDirection={"column"}
                minH="200px"
                // flex="1"
                justifyContent={"space-between"}
              >
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">
                    Existing Password
                  </FormLabel>
                  <InputGroup size={"sm"}>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<AiOutlineLock />}
                    />
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Existing Password"
                      name="password"
                      id="oldPw"
                      required
                    />
                    <InputRightElement>
                      <IconButton
                        _hover={{ bg: "none" }}
                        _focus={{ outline: "none" }}
                        _active={{ bg: "none" }}
                        variant="ghost"
                        aria-label="showHide"
                        onClick={() => setShowCurrent(!showCurrent)}
                        icon={
                          showCurrent ? <AiFillEye /> : <AiFillEyeInvisible />
                        }
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">
                    New Password
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

                    <InputGroup size={"sm"}>
                      <InputLeftElement
                        pointerEvents="none"
                        children={<AiOutlineLock />}
                      />
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="New Password"
                        name="password"
                        required
                        minLength={8}
                        id="newPw"
                        value={newPw}
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
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">
                    Confirm New Password
                  </FormLabel>
                  <InputGroup size={"sm"}>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<AiOutlineLock />}
                    />
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="Confirm New Password"
                      name="password"
                      required
                      minLength={8}
                      id="confirmNewPw"
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
              </Flex>
              <Flex justifyContent="flex-end" mt="4">
                <Button size={"sm"} onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  ml="5"
                  size={"sm"}
                  _focus={{ outline: "none" }}
                  borderRadius="md"
                  color="white"
                  bg="poldit.100"
                  _hover={{ bg: "orange.300" }}
                  _active={{
                    bg: "poldit.100",
                  }}
                >
                  Submit
                </Button>
              </Flex>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </>
  );
};

export default ChangePW;
