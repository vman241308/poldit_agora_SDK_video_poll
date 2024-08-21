import Link from "next/link";
import {
  Box,
  Spinner,
  Text,
  Flex,
  Button,
  IconButton,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Circle,
  useDisclosure,
  Modal,
  ModalOverlay,
  Avatar,
  Tooltip,
  ModalContent,
  ModalBody,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  useOutsideClick,
} from "@chakra-ui/react";
import { FiUsers } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { NavLinks, NavType } from "./data";
import AboutIcon from "./AboutIcon";
import Notifications from "../Notifications/Notifications";
import { AiFillCaretDown } from "react-icons/ai";
import FollowerWindow from "../Home/FollowerWindow";
import { useRef, useState } from "react";
import AskQuestion from "./CreatePoll";

export const MenuItems_LoggedIn = ({
  userId,
  userData,
  navLink,
  logOut,
  followers,
}: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <HStack spacing="3">
      <Notifications userId={userId} />
      {/* <AboutIcon /> */}
      {/* <FollowerBtn followers={followers} /> */}
      <Link href="/newPoll">
      <Button
        variant="outline"
        color="#ff4d00"
        onClick={onOpen}
        borderColor="#ff4d00"
        _hover={{ bg: "#ff4d00", color: "white" }}
        _active={{ outline: "none" }}
        _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
        size="sm"
      >
        Ask Question
      </Button>
      {/* <AskQuestion isOpen={isOpen} onClose={onClose} /> */}
      </Link>
      <ProfileNav userData={userData} navLink={navLink} logOut={logOut} />
    </HStack>
  );
};

export const MenuItems_LoggedOut = () => {
  return (
    <HStack spacing="3">
      {/* <AboutIcon /> */}
      <Link href="/Login">
        <Button
          variant="outline"
          color="#ff4d00"
          borderColor="#ff4d00"
          _hover={{ bg: "#ff4d00", color: "white" }}
          _active={{ outline: "none" }}
          _focus={{ outline: "none" }}
          size="sm"
          mx="2"
        >
          Log in or Register
        </Button>
      </Link>
    </HStack>
  );
};

export const Menu_Dropdown_LoggedOut = () => (
  <Box>
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={"menuDropdown"}
        variant="outline"
        fontSize={"20px"}
        color="poldit.100"
        borderColor="poldit.100"
        _hover={{ bg: "poldit.100", color: "white" }}
        _active={{ outline: "none" }}
        _focus={{ outline: "none" }}
        icon={<GiHamburgerMenu />}
      />
      <MenuList
        boxShadow="0 10px 30px -1px rgba(0,0,0,.4)"
        h="160px"
        position={"relative"}
      >
        <Link href="/Login">
          <MenuItem
            _hover={{
              bg: "poldit.100",
              color: "white",
              outline: "none",
              borderRadius: "none",
            }}
            _focus={{
              outline: "none",
            }}
            fontSize="sm"
          >
            <Text>Log in or Register</Text>
          </MenuItem>
        </Link>
        <Link href="/About">
          <MenuItem
            _hover={{
              bg: "poldit.100",
              color: "white",
              outline: "none",
              borderRadius: "none",
            }}
            _focus={{
              outline: "none",
            }}
            fontSize="sm"
          >
            <Text>About Poldit</Text>
          </MenuItem>
        </Link>
        <Link href="/Contact">
          <MenuItem
            _hover={{
              bg: "poldit.100",
              color: "white",
              outline: "none",
              borderRadius: "none",
            }}
            _focus={{
              outline: "none",
            }}
            fontSize="sm"
          >
            <Text>Contact Us</Text>
          </MenuItem>
        </Link>
        <MenuFooter />
      </MenuList>
    </Menu>
  </Box>
);

export const MenuSpinner = (props: any) => {
  return (
    <>
      <Spinner color="poldit.100" size="lg" />
    </>
  );
};

export const Menu_Dropdown = ({ navLink, logOut, isMobile }: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={"menuDropdown"}
        variant="outline"
        fontSize={"20px"}
        color="poldit.100"
        borderColor="poldit.100"
        _hover={{ bg: "poldit.100", color: "white" }}
        _active={{ outline: "none" }}
        _focus={{ outline: "none" }}
        icon={<GiHamburgerMenu />}
      />
      <MenuList
        boxShadow="0 10px 30px -1px rgba(0,0,0,.4)"
        h="250px"
        position={"relative"}
      >
        <Link href="/newPoll">
        <MenuItem
          _hover={{
            bg: "poldit.100",
            color: "white",
            outline: "none",
            borderRadius: "none",
          }}
          _focus={{
            outline: "none",
          }}
          fontSize="sm"
          onClick={onOpen}
        >
          <Text>Ask Question</Text>
          {/* <AskQuestion isOpen={isOpen} onClose={onClose} isMobile={isMobile} /> */}
        </MenuItem>
        </Link>
        {NavLinks.map((l: NavType) => (
          <MenuItem
            onClick={() => navLink(l.url as string)}
            _hover={{
              bg: "poldit.100",
              color: "white",
              outline: "none",
              borderRadius: "none",
            }}
            _focus={{
              outline: "none",
            }}
            key={l.id}
            fontSize="sm"
          >
            {l.link}
          </MenuItem>
        ))}
        <MenuItem
          _hover={{
            bg: "poldit.100",
            color: "white",
            outline: "none",
            borderRadius: "none",
          }}
          _focus={{
            outline: "none",
          }}
          fontSize="sm"
          onClick={logOut}
        >
          Logout
        </MenuItem>
        <MenuFooter />
      </MenuList>
    </Menu>
  );
};

const MenuFooter = () => (
  <Flex
    borderTop={"1px"}
    borderTopColor="gray.300"
    bottom="0"
    fontSize={"xx-small"}
    alignItems="center"
    w="full"
    p="2"
    position="absolute"
  >
    <Link href={"/terms"}>
      <Text
        color="gray.500"
        _hover={{
          color: "blue.600",
          fontWeight: "semibold",
        }}
        cursor="pointer"
      >
        Terms
      </Text>
    </Link>
    <Circle size="3px" bg="gray.600" ml="3" mr="3" />
    <Link href={"/privacy"}>
      <Text
        color="gray.500"
        _hover={{
          color: "blue.600",
          fontWeight: "semibold",
        }}
        cursor="pointer"
      >
        Privacy Policy
      </Text>
    </Link>
  </Flex>
);

const ProfileNav = ({ userData, navLink, logOut }: any) => {
  return (
    <Box display={{ md: "flex", base: "none" }}>
      <Menu>
        <MenuButton
          as={IconButton}
          color="gray.600"
          rightIcon={<AiFillCaretDown style={{ marginLeft: "-5px" }} />}
          aria-label="Options"
          icon={
            <Avatar
              boxSize={"42px"}
              color="white"
              name={`${userData?.getAppUserData?.firstname} ${userData?.getAppUserData?.lastname}`}
              bg="gray.500"
              src={userData?.getAppUserData?.profilePic ?? ""}
              // ignoreFallback={true}
            />
          }
          variant="outline"
          border="none"
          _focus={{ outline: "none" }}
          _active={{ bg: "none" }}
          _hover={{ bg: "none" }}
        />
        <MenuList
          position={"relative"}
          h="230px"
          boxShadow="0 10px 30px -1px rgba(0,0,0,.4)"
        >
          {NavLinks.map((l: NavType) => (
            <MenuItem
              onClick={() => navLink(l.url as string)}
              _hover={{
                bg: "poldit.100",
                color: "white",
                outline: "none",
                borderRadius: "none",
              }}
              _focus={{
                outline: "none",
              }}
              key={l.id}
              fontSize="sm"
            >
              {l.link}
            </MenuItem>
          ))}
          <MenuItem
            _hover={{
              bg: "poldit.100",
              color: "white",
              outline: "none",
              borderRadius: "none",
            }}
            _focus={{
              outline: "none",
            }}
            fontSize="sm"
            onClick={() => logOut()}
          >
            Logout
          </MenuItem>

          <Flex
            borderTop={"1px"}
            borderTopColor="gray.300"
            bottom="0"
            fontSize={"xx-small"}
            alignItems="center"
            w="full"
            p="2"
            position="absolute"
          >
            <Link href={"/terms"}>
              <Text
                color="gray.500"
                _hover={{
                  color: "blue.600",
                  fontWeight: "semibold",
                }}
                cursor="pointer"
              >
                Terms
              </Text>
            </Link>
            <Circle size="3px" bg="gray.600" ml="3" mr="3" />
            <Link href={"/privacy"}>
              <Text
                color="gray.500"
                _hover={{
                  color: "blue.600",
                  fontWeight: "semibold",
                }}
                cursor="pointer"
              >
                Privacy Policy
              </Text>
            </Link>
          </Flex>
        </MenuList>
      </Menu>
    </Box>
  );
};

export const FollowerBtn = ({ followers }: { followers: string[] }) => {
  const ref = useRef();
  const [isOpen, setIsOpen] = useState(false);
  useOutsideClick({
    ref: ref as any,
    handler: () => setIsOpen(false),
  });

  return (
    <Tooltip
      label="See which users are online"
      hasArrow
      placement="bottom"
      rounded={"md"}
      width="120px"
      isDisabled={isOpen}
    >
      <Box id="followerBtn">
        <Popover isLazy>
          <PopoverTrigger>
            <IconButton
              aria-label="followerWindow"
              id="followerBtn"
              fontSize={"24px"}
              color="poldit.100"
              borderColor="poldit.100"
              border="1px"
              bg="none"
              boxSize={"40px"}
              icon={<FiUsers />}
              isRound
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none" }}
              onClick={() => setIsOpen(true)}
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton
              _active={{ outline: "none" }}
              _focus={{ outline: "none" }}
              mt="1"
            />
            <PopoverBody
              boxShadow="0 10px 30px -1px rgba(0,0,0,.4)"
              rounded={"md"}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", border: "none" }}
            >
              <Box ref={ref as any}>
                <FollowerWindow followers={followers} />
              </Box>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Tooltip>
  );
};
