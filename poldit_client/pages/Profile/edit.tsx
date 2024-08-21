import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import Layout from "_components/layout/Layout";
import { ErrorMssg, SelectedImage, User } from "_components/appTypes/appType";
import { useQuery, useMutation } from "@apollo/client";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import { monthList, getYear } from "../../components/appData";
import SingleImgPick from "_components/pageComponents/Other/Image/singleImg";
import { errorHandling } from "_components/formFuncs/errorFuncs";
import { saveImgtoCloud } from "_components/apis/imgUpload";
import { useRouter } from "next/router";
import Metadata from "_components/pageComponents/Other/Metadata";
import ChangePW from "_components/pageComponents/Profile/ChangePW";

const EditProfile = (props: {}) => {
  const toast = useToast();
  const [userDetails, updateUserDetails] = useState<User | undefined>();
  const [selectedImg, setSelectImg] = useState<SelectedImage>();
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data } = useQuery(GraphResolvers.queries.GET_USER_BASIC_PROFILE, {
    onCompleted: (res) => {
      updateUserDetails(res.getUserBasicProfile);
      const imgObj: SelectedImage = {
        imageName: "profileImg",
        image: "",
        imageUri: res.getUserBasicProfile.profilePic,
        userId: res.getUserBasicProfile._id,
        imgType: "profile",
      };
      setSelectImg(imgObj);
    },
  });

  const [updateUser] = useMutation(GraphResolvers.mutations.UPDATE_USER);

  const handleImg = (imgObj: SelectedImage) => {
    setSelectImg(imgObj);
  };

  let month = monthList;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isOpen) {
      let { formObj } = errorHandling();
      const bio = document.getElementsByTagName("textarea")[0].value;
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
        let finalForm: any = {};
        const finalData: any = { ...formObj, bio };
        for (const key in finalData) {
          if (!finalData[key]) {
            continue;
          }

          if (key === "profilepic" && finalData.profilepic && selectedImg) {
            const imgId = await saveImgtoCloud([selectedImg]);

            if (imgId.length > 0) {
              finalForm["profilePic"] = imgId[0].img;
            }
            continue;
          }

          finalForm[key] = finalData[key];
        }

        await updateUser({
          variables: { formInputs: JSON.stringify(finalForm) },
          onCompleted: (res) =>
            toast({
              title: "Profile Updated!",
              status: "success",
              isClosable: true,
              duration: 4000,
            }),
        });

        router.push(`/Profile/${data.getUserBasicProfile.appid}`);
      } catch (err: any) {
        toast({
          title: err.message,
          status: "error",
          isClosable: true,
          duration: 3000,
        });
      }
    }
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    userDetails &&
      updateUserDetails({
        ...userDetails,
        [e.target.id as keyof User]: e.target.value,
      });
  };

  return (
    <Layout>
      <Metadata title="Edit Profile" />

      <Container maxW={"6xl"}>
        <Flex align="center" justify="center" minH="calc(100vh - 90px)">
          <Box
            w="100%"
            px={{ base: 6, sm: 14 }}
            pt="6"
            bgGradient="linear(to-br, white, orange.50)"
            borderRadius="lg"
            boxShadow="lg"
          >
            <Box>
              <Text
                fontSize={["xl", "xl", "2xl"]}
                pb="2"
                fontWeight="bold"
                color={"poldit.100"}
                textAlign={"center"}
              >
                Edit Profile
              </Text>
            </Box>
            {!userDetails ? (
              <Flex justify="center" align="center" minH="300px">
                <Spinner size="lg" color="poldit.100" />
              </Flex>
            ) : (
              <Box pb="12">
                <Flex
                  justify="center"
                  align="center"
                  mb="8"
                  mt="4"
                  direction="column"
                >
                  <Box position="relative">
                    <Avatar
                      name={`${userDetails?.firstname} ${userDetails?.lastname}`}
                      src={selectedImg?.imageUri}
                      border="none"
                      bg="gray.500"
                      color="white"
                      size="2xl"
                    />
                    <IconButton
                      aria-label="editButton"
                      icon={
                        <SingleImgPick
                          imgSize="22px"
                          handleImg={handleImg}
                          userId={userDetails._id}
                          required={true}
                          imgId="profilePic"
                          imageName="profilePic"
                        />
                      }
                      position="absolute"
                      _focus={{ outline: "none" }}
                      bottom="4px"
                      bg="gray.200"
                      color="gray.600"
                      right="0"
                      size="sm"
                      borderRadius="50%"
                    />
                  </Box>
                </Flex>
                <form onSubmit={handleSubmit} id="editProfile">
                  <Stack direction={["column", "column", "row"]}>
                    <FormControl>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <Input
                        id="email"
                        borderColor="gray.300"
                        value={userDetails?.email}
                        onChange={handleChange}
                        disabled
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="username">Username</FormLabel>
                      <Input
                        id="appid"
                        borderColor="gray.300"
                        value={userDetails?.appid}
                        onChange={handleChange}
                        disabled
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction={["column", "column", "row"]} mt="5">
                    <FormControl>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <Input
                        id="firstname"
                        borderColor="gray.300"
                        value={userDetails?.firstname}
                        onChange={handleChange}
                        isRequired
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <Input
                        id="lastname"
                        borderColor="gray.300"
                        value={userDetails?.lastname}
                        onChange={handleChange}
                        isRequired
                      />
                    </FormControl>
                  </Stack>
                  <FormLabel htmlFor="birthday" mt="5">
                    Birthday
                  </FormLabel>
                  <Stack direction={["column", "column", "column", "row"]}>
                    <FormControl>
                      <Select
                        id="bday_month"
                        isRequired
                        defaultValue={
                          data && data.getUserBasicProfile.birthday
                            ? (
                                data.getUserBasicProfile.birthday as string
                              ).split("/")[0]
                            : undefined
                        }
                      >
                        <option value="" hidden>
                          Month
                        </option>
                        {month.map((x) => (
                          <option value={x} key={x}>
                            {x}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <Select
                        id="bday_day"
                        isRequired
                        defaultValue={
                          data && data.getUserBasicProfile.birthday
                            ? (
                                data.getUserBasicProfile.birthday as string
                              ).split("/")[1]
                            : undefined
                        }
                      >
                        <option value="" hidden>
                          Day
                        </option>
                        {Array.from(Array(31).keys()).map((x) => (
                          <option value={x + 1} key={x}>
                            {x + 1}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <Select
                        id="bday_year"
                        isRequired
                        defaultValue={
                          data && data.getUserBasicProfile.birthday
                            ? (
                                data.getUserBasicProfile.birthday as string
                              ).split("/")[2]
                            : undefined
                        }
                      >
                        <option value="" hidden>
                          Year
                        </option>
                        {getYear().map((x) => (
                          <option value={x} key={x}>
                            {x}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Flex mt="5">
                    <FormControl>
                      <FormLabel htmlFor="aboutme">About Me</FormLabel>
                      <Textarea
                        id="bio"
                        name="aboutMe"
                        borderColor="gray.300"
                        value={userDetails?.bio ?? ""}
                        onChange={handleChange}
                        maxLength={400}
                      />
                    </FormControl>
                  </Flex>
                  <Flex mt="4" gridGap="5" justify="flex-start">
                    <Button
                      variant="outline"
                      color="#ff4d00"
                      borderColor="#ff4d00"
                      _hover={{ bg: "#ff4d00", color: "white" }}
                      _active={{ outline: "none" }}
                      _focus={{ outline: "none" }}
                      size="sm"
                      onClick={onOpen}
                    >
                      Change Password
                    </Button>
                    <Modal isOpen={isOpen} onClose={onClose} isCentered>
                      <ModalOverlay />
                      <ChangePW close={onClose} />
                    </Modal>
                    {/* <Button>Delete Profile</Button> */}
                  </Flex>
                  <Flex mt="4" gridGap="5" justify="flex-end">
                    <Button
                      onClick={() =>
                        router.push(
                          `/Profile/${data.getUserBasicProfile.appid}`
                        )
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      _focus={{ outline: "none" }}
                      borderRadius="md"
                      color="white"
                      bg="poldit.100"
                      _hover={{ bg: "orange.300" }}
                      _active={{
                        bg: "poldit.100",
                      }}
                      type="submit"
                    >
                      Update
                    </Button>
                  </Flex>
                </form>
              </Box>
            )}
          </Box>
        </Flex>
      </Container>
    </Layout>
  );
};
export default EditProfile;
