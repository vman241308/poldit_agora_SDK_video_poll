import { Box, Alert, AlertIcon, Text } from "@chakra-ui/react";
import Link from "next/link";

interface AppMssg {
  msg: string;
  msgType: "error" | "info" | "warning" | "success";
  route?: string;
}

const AppMssg = ({ msg, msgType, route }: AppMssg) => {
  return (
    <Link href={route ? route : ""}>
      <Alert
        status={msgType}
        rounded={"md"}
        cursor={"pointer"}
        _hover={{ fontWeight: "semibold" }}
      >
        <AlertIcon />
        <Text fontSize={"sm"} color="gray.500">
          {msg}
        </Text>
      </Alert>
    </Link>
  );
};

export default AppMssg;
