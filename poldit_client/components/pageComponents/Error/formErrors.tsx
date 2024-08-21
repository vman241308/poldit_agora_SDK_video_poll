import {
  Box,
  Flex,
  IconButton,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  Text,
} from "@chakra-ui/react";
import { BsCheck } from "react-icons/bs";

interface ErrorForm {
  errs: { errMatch: boolean; msg: string }[];
  marginRight?: string;
  marginLeft?: string;
}

const ErrorForm = ({ errs, marginLeft, marginRight }: ErrorForm) => {
  return (
    <Box>
      <PopoverContent
        _focus={{ outline: "none" }}
        w="250px"
        ml={marginLeft ?? "0"}
        mr={marginRight ?? "0"}
        boxShadow="0 10px 30px -1px rgba(0,0,0,.4)"
      >
        <PopoverArrow />
        <PopoverBody>
          <Flex flexDirection={"column"}>
            <Text
              alignSelf={"center"}
              fontSize="sm"
              color="gray.400"
              fontWeight={"semibold"}
            >
              Password Checklist
            </Text>
            {errs.map((item, idx) => (
              <Box
                key={idx}
                m="1"
                p="1"
                bg={item.errMatch ? "red.300" : "green.300"}
                rounded="md"
              >
                <Text
                  fontSize={{ base: "xs", sm: "sm", md: "sm", lg: "sm" }}
                  color={"white"}
                >
                  {item.msg}
                </Text>
              </Box>
            ))}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Box>
  );
};

export default ErrorForm;

export const MobileErrorForm = ({ errs }: ErrorForm) => (
  // <>
  //   <Text
  //     alignSelf={"center"}
  //     fontSize="sm"
  //     color="gray.400"
  //     fontWeight={"semibold"}
  //     mb="2"
  //   >
  //     Password Checklist
  //   </Text>
  // </>
  <Flex flexDirection={"column"} w="100%">
    <Text
      alignSelf={"center"}
      fontSize="sm"
      color="gray.400"
      fontWeight={"semibold"}
      mb="2"
    >
      Password Checklist
    </Text>
    {errs.map((item, idx) => (
      <Box
        key={idx}
        m="1"
        p="2"
        bg={item.errMatch ? "red.300" : "green.300"}
        rounded="md"
      >
        <Text fontSize={{ base: "xs", sm: "sm", md: "sm", lg: "sm" }} color={"white"}>
          {item.msg}
        </Text>
      </Box>
    ))}
  </Flex>
);
