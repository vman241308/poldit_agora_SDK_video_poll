import { Flex, HStack, Tag, TagLabel } from "@chakra-ui/react";
import React from "react";
import { BsFillCameraVideoOffFill } from "react-icons/bs";
import { FaVolumeMute } from "react-icons/fa";
import { IUserPresence } from "_components/hooks/channel/useChannel";

interface IIconOverlayProps {
  member: IUserPresence;
}

const IconOverlay = ({ member }: IIconOverlayProps) => {
  const iconBtnProps = {
    size: "20px",
    color: "#e93d16",
  };

  return (
    <Flex
      position="absolute"
      bottom={2}
      zIndex={5}
      pl="2"
      pr="2"
      w="100%"
      justifyContent="space-between"
      alignItems="center"
    >
      <Tag bg={member.isMod ? "poldit.100" : "green.400"} variant={"solid"}>
        <TagLabel>{member.isMod ? "Host" : "Panel"}</TagLabel>
      </Tag>
      <HStack spacing="3">
        {member.isStreaming && !member.showCam && !member.isScreenSharing && (
          <BsFillCameraVideoOffFill {...iconBtnProps} />
        )}
        {(member.isStreaming || member.isScreenSharing) && !member.muteMic && (
          <FaVolumeMute {...iconBtnProps} />
        )}
      </HStack>
    </Flex>
  );
};

export default IconOverlay;
