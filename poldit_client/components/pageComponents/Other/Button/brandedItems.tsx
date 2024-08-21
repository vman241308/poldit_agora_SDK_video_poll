import {
  Box,
  Button,
  Text,
  Center,
  Flex,
  HStack,
  Icon,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Circle,
} from "@chakra-ui/react";
import Link from "next/link";
import { ReactNode } from "react";

export const BrandButton = ({ children }: any) => {
  return (
    <Button
      color="gray.400"
      borderColor="gray.400"
      _hover={{
        bg: "#ff4d00",
        color: "white",
        borderColor: "gray.400",
      }}
      _active={{ outline: "none" }}
      _focus={{ outline: "none" }}
      variant="outline"
    >
      {children}
    </Button>
  );
};

interface PolditBtn {
  link?: string;
  btnLabel: string;
  btnAction?: any;
  btnVal?: any;
  width?: string;
  styles?: any;
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
}

export const PoldItNavBtn = ({ link, btnLabel }: PolditBtn) => (
  <Link href={link as string}>
    <Button
      variant="outline"
      color="#ff4d00"
      borderColor="#ff4d00"
      _hover={{ bg: "#ff4d00", color: "white" }}
      _active={{ outline: "none" }}
      _focus={{ outline: "none" }}
      size="sm"
    >
      {btnLabel}
    </Button>
  </Link>
);

export const PoldItActionBtn = ({
  btnLabel,
  btnAction,
  width,
  size,
  loading,
  disabled,
}: PolditBtn) => (
  <Button
    variant="outline"
    color="#ff4d00"
    borderColor="#ff4d00"
    _hover={{ bg: "#ff4d00", color: "white" }}
    _active={{ outline: "none" }}
    _focus={{ outline: "none" }}
    size={size ?? "sm"}
    onClick={btnAction}
    w={width ? width : "auto"}
    isLoading={loading ?? false}
    disabled={disabled ?? false}
  >
    {btnLabel}
  </Button>
);
export const BrandTag = ({ children, size }: any) => {
  return (
    <Tag
      color="gray.400"
      borderColor="gray.400"
      borderRadius="full"
      cursor="pointer"
      size={size}
      pt="2"
      pb="2"
      _hover={{
        bg: "#ff4d00",
        color: "white",
        borderColor: "gray.400",
      }}
      _active={{ outline: "none" }}
      _focus={{ outline: "none" }}
      variant="outline"
      minWidth="80px"
      alignItems={"center"}
    >
      {children}
    </Tag>
  );
};

export const BrandCircle = (props: any) => (
  <Box
    {...props}
    w="22px"
    h="22px"
    lineHeight="0"
    rounded="full"
    border="1px solid white"
    overflow={"hidden"}
  >
    {props.children}
  </Box>
);
