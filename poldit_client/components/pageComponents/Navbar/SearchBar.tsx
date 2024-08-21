import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  IconButton,
  MenuButton,
  Menu,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { AiOutlineSearch } from "react-icons/ai";
import { useAuth } from "_components/authProvider/authProvider";

interface NavSearch {
  searchVal: string;
}

export const NavSearch = ({ searchVal }: NavSearch) => {
  const router = useRouter();
  const appContext = useAuth();

  const goToSearch = (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { key } = e as React.KeyboardEvent<HTMLInputElement>;
    const { target } = e as React.ChangeEvent<HTMLInputElement>;

    if (key === "Enter" && target.value.length > 0) {
      e.preventDefault();

      router.push(
        { pathname: "/Search", query: { searchVal: target.value } },
        "/Search"
      );
    }
  };

  return (
    <Box
      color="gray.200"
      justifyContent="center"
      alignItems="center"
      ml={[6, 6, 6, 6]}
      mr={[6, 6, 6, 6]}
    >
      <InputGroup width={{ md: 350, lg: 500 }}>
        <InputLeftElement
          pointerEvents="none"
          children={<AiOutlineSearch size="20px" />}
          color="gray.600"
        />
        <Input
          type="text"
          placeholder="Search questions, keywords or users!"
          color="gray.600"
          borderColor="gray.300"
          //   w={[200, 300, 400]}
          value={searchVal}
          onKeyDown={goToSearch}
          onChange={(e) => appContext?.handleSearch(e.target.value)}
        />
      </InputGroup>
    </Box>
  );
};

export const NavSearchBtn = ({ searchVal }: NavSearch) => {
  return (
    <Box>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label={"sarchDropdown"}
          fontSize={"20px"}
          bg="gray.300"
          _hover={{ outline: "none", bg: "gray.600", color: "white" }}
          _focus={{ outline: "none" }}
          _active={{ outline: "none", bg: "gray.600", color: "white" }}
          icon={<AiOutlineSearch />}
          isRound
        />
        <MenuList boxShadow="0 10px 30px -1px rgba(0,0,0,.4)" w="400px">
          <NavSearch searchVal={searchVal} />
        </MenuList>
      </Menu>
    </Box>
  );
};
