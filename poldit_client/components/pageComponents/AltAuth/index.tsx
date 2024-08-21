import { Button, Stack } from "@chakra-ui/react";
import { AiOutlineGoogle, AiOutlineMail } from "react-icons/ai";
import { FaFacebookF } from "react-icons/fa";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const AltLogIns = ({ providers, signIn }: any) => {

  return (
    <Stack spacing={"3"}>
      <Button
        leftIcon={<AiOutlineGoogle />}
        rounded="md"
        fontSize="sm"
        colorScheme={"red"}
        variant="outline"
        isLoading={false}
        _focus={{ outline: "none" }}
        onClick={() => signIn(providers.google.id)}
      >
        Log in or Register with Google
      </Button>
      <Button
        leftIcon={<FaFacebookF />}
        rounded="md"
        colorScheme={"facebook"}
        variant="outline"
        fontSize="sm"
        _focus={{ outline: "none" }}
        onClick={() => signIn(providers.facebook.id)}
      >
        Log in or Register with Facebook
      </Button>
      <Link href="/Registration">
        <Button
          leftIcon={<AiOutlineMail />}
          rounded="md"
          fontSize="sm"
          borderColor={"poldit.100"}
          variant="outline"
          color={"poldit.100"}
          _hover={{ bgColor: "poldit.100", color: "white" }}
          _focus={{ outline: "none" }}
          onClick={() => {
            Cookies.remove("polditSession", { path: "/Login" });
            signOut({ redirect: false });
          }}
        >
          Register with Email
        </Button>
      </Link>
    </Stack>
  );
};

export default AltLogIns;
