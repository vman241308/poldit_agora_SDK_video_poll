import {
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { IoIosNotifications } from "react-icons/io";
import { BrandCircle } from "../Other/Button/brandedItems";
import NotificationContainer from "./NotifiyDropdown";

const Notifications = ({ userId }: any) => {
  const [showNotifyDot, setShowNotifyDot] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Box >
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="notifications"
          onClick={onClose}
          icon={
            <Box pr="3">
              <IoIosNotifications size="45px" />
              {showNotifyDot && (
                
                <BrandCircle
                  top="17px"
                  right="7px"
                  position="absolute"
                  bg="poldit.100"
                >
                  <Text
                    color="white"
                    position={"absolute"}
                    bottom="50%"
                    width="100%"
                    fontSize={"xs"}
                    textAlign="center"
                  >
                    {unreadNotifications}
                  </Text>
                </BrandCircle>
              )}
            </Box>
          }
          color="gray.600"
          variant="ghost"
          boxSize={"40px"}
          position="relative"
          _hover={{ bg: "none" }}
          _focus={{ outline: "none" }}
          _active={{ bg: "none" }}
        />
        <MenuList boxShadow="0 10px 30px -1px rgba(0,0,0,.4)" w="400px">
          <NotificationContainer
            userId={userId}
            setShowNotifyDotHandler={setShowNotifyDot}
            setUnreadCount={setUnreadNotifications}
          />
        </MenuList>
      </Menu>
    </Box>
  );
};

export default Notifications;
