import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLock,
  AiOutlineUser,
} from "react-icons/ai";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useMutation } from "@apollo/client";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import jwtDecode from "jwt-decode";
import { VerificationToken } from "_components/pageComponents/Registration/verification";
import AltLogIns from "_components/pageComponents/AltAuth";
import { getProviders, getSession, signIn } from "next-auth/react";
import { useAuth } from "_components/authProvider/authProvider";
import Metadata from "_components/pageComponents/Other/Metadata";

const LoginPage = ({ providers, session }: any) => {
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [verify, showVerify] = useState(false);
  const [userId, setUserId] = useState("");

  const currSessionCookie = Cookies.get("polditSession");

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (auth?.checkSessionToken()) {
      router.push("/");
    }
  }, []);

  const { queries, mutations } = GraphResolvers;
  const [login, { loading }] = useMutation(mutations.LOGIN, {
    refetchQueries: [
      { query: queries.GET_USER, variables: { userId: userId } },
    ],
  });

  const onAltLoginSubmit = async (provider: string) => {
    let href = "";

    if (process.env.NODE_ENV === "development") {
      href = `${process.env.NEXT_PUBLIC_DEV_URL as string}/`;
    } else {
      href = `${process.env.NEXT_PUBLIC_PROD_URL as string}/`;
    }

    try {
      // const isnewUser = true;
      const res = await signIn(provider, {
        // callbackUrl: isnewUser ? href + "About" : href,
        callbackUrl: `${process.env.NEXTAUTH_URL as string}/`,
      });

      toast({
        title: "Login successfull!",
        status: "success",
        isClosable: true,
        duration: 3000,
      });
    } catch (err: any) {
      toast({
        title: err.message,
        status: "error",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  const onLoginSubmit = async (e: any) => {
    e.preventDefault();

    setEmail(e.target.email.value);

    let formData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      const { data } = await login({
        variables: { credentials: JSON.stringify(formData) },
      });
      let decoded: any = jwtDecode(data?.login);
      if (decoded?.id) {
        setUserId(decoded?.id);
      }

      Cookies.remove("polditSession");
      Cookies.set("polditSession", data.login, {
        expires: 30,
      });
      toast({
        title: "Login successfull!",
        status: "success",
        isClosable: true,
        duration: 3000,
      });
      router.push("/");
    } catch (error: any) {
      error.message.search("Please verify your email") > -1 && showVerify(true);

      toast({
        title: error.message,
        status: "error",
        isClosable: true,
        duration: 3000,
      });
    }
  };

  if (session && session.isNewUser) {
    return <Box>This is a test</Box>;
  }

  if (session || currSessionCookie) {
    return (
      <Box minH="100vh" h="100vh" bg="gray.200">
        <Flex align="center" justify="center" minH="100vh">
          <Spinner color="poldit.100" size={"lg"} />
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" h="100vh" bg="gray.200">
      <Metadata title="Poldit Login" />
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
          <Flex justify="center">
            <Image
              src="https://res.cloudinary.com/rahmad12/image/upload/v1624921500/PoldIt/App_Imgs/PoldIt_logo_only_agkhlf.png"
              w="140px"
              cursor="pointer"
            />
          </Flex>
          <Box pt="2" pb="2">
            <AltLogIns providers={providers} signIn={onAltLoginSubmit} />
          </Box>
          <Box
            borderBottom={"1px"}
            borderColor="gray.300"
            mb="5"
            mt="5"
            position={"relative"}
          >
            <Box
              position={"absolute"}
              top="-12px"
              pl="2"
              pr="2"
              right={"46%"}
              bg="white"
            >
              <Text fontSize={"sm"} color="gray.500">
                or
              </Text>
            </Box>
          </Box>
          <form onSubmit={onLoginSubmit}>
            <Box>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  children={<AiOutlineUser />}
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  minW={{ base: "100px", sm: "320px" }}
                  required
                />
              </InputGroup>
            </Box>
            <Box mt="6">
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  children={<AiOutlineLock />}
                />
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  required
                />
                <InputRightElement>
                  <IconButton
                    _hover={{ bg: "none" }}
                    _focus={{ outline: "none" }}
                    _active={{ bg: "none" }}
                    variant="ghost"
                    aria-label="showHide"
                    onClick={() => setShow(!show)}
                    icon={show ? <AiFillEye /> : <AiFillEyeInvisible />}
                  />
                </InputRightElement>
              </InputGroup>
            </Box>
            {!verify ? (
              <>
                <Box mt="4" mb="3">
                  <Link href="/ForgotPassword">
                    <Text fontSize="sm" color="blue.300" cursor="pointer">
                      Forgot Password?
                    </Text>
                  </Link>
                </Box>
                <Box>
                  <Button
                    w="100%"
                    _focus={{ outline: "none" }}
                    borderRadius="md"
                    type="submit"
                    color="white"
                    //bgGradient="linear(to-l, poldit.100 , orange.300  )"
                    bg="poldit.100"
                    _hover={{ bg: "orange.300" }}
                    _active={{
                      bg: "poldit.100",
                    }}
                    // isLoading={loading}
                  >
                    Login
                  </Button>
                </Box>
                <Box mt="3" w="320px" fontSize="sm" color="gray.500">
                  By continuing or registering, you agree to our{" "}
                  <a
                    style={{
                      color: "blue",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                    href="/terms"
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
                    href="/privacy"
                  >
                    privacy policy.
                  </a>
                </Box>
              </>
            ) : (
              <Box
                mt="5"
                onClick={() => setTimeout(() => router.reload(), 3000)}
              >
                <VerificationToken email={email ?? ""} />
              </Box>
            )}
          </form>
        </Box>
      </Flex>
    </Box>
  );
};
export default LoginPage;

LoginPage.getInitialProps = async (ctx: any) => {
  return {
    providers: await getProviders(),
    session: await getSession(ctx),
  };
};
