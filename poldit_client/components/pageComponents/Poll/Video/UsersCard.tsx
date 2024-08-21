import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Spacer,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/react";
import { Types } from "ably";
import { data } from "jquery";
import { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { BsBroadcastPin } from "react-icons/bs";
import { CgScreen } from "react-icons/cg";
import { FaUserAlt } from "react-icons/fa";
import { IoHandLeftSharp } from "react-icons/io5";
import {
  MdAddToQueue,
  MdRemoveFromQueue,
  MdVideoCameraFront,
} from "react-icons/md";
import { RiLiveFill } from "react-icons/ri";
import { User } from "_components/appTypes/appType";
import {
  IUserPresence,
  TOtherChannelHandler,
} from "_components/hooks/channel/useChannel";
import Scrollbars from "_components/pageComponents/Other/Scrollbar";
import { UserAvatar } from "../ChatBox/chatvideoComps";
// import { THandlePanel } from "./video";

interface UsersCardProps {
  data: IUserPresence[];
  handlePanel: TOtherChannelHandler;
  isCreator: boolean;
  mssgs: Types.Message[];
  startPoll: boolean | undefined;
}

const UsersCard = (props: UsersCardProps) => {
  const hasScreenShareOrVideo = props.data.some(
    (x) => x.isScreenSharing || x.isStreaming
  );

  return (
    <>
      <Heading size="sm" textAlign={"center"} pb="2" pt="2" color="poldit.100">
        Users Online
      </Heading>
      <Scrollbars
        style={{
          // height: "100%",
          // minHeight: "200px",
          maxHeight: "290px",
          paddingRight: "8px",
          paddingBottom: "8px",
          overflowX: "hidden",
        }}
      >
        <Stack spacing={4} pl="2">
          {props.data.map((x, idx) => (
            <UserCard
              key={idx}
              columns={hasScreenShareOrVideo ? 4 : 3}
              isCreator={props.isCreator}
              latestMssgs={
                props.mssgs.filter((x) => x.name === x.data.appid) ?? []
              }
              handlePanel={props.handlePanel}
              startPoll={props.startPoll}
              data={{
                creator: { ...x },
              }}
            />
          ))}
        </Stack>
      </Scrollbars>
    </>
  );
};

export default UsersCard;

interface UserCardProps {
  data: { creator: IUserPresence };
  columns: number;
  isCreator: boolean;
  handlePanel: TOtherChannelHandler;
  latestMssgs: Types.Message[];
  startPoll: boolean | undefined;
}

const UserCard = (props: UserCardProps) => {
  const { isMod, appid } = props.data.creator;

  const handleInvite = () => {
    props.handlePanel({
      ...props.data.creator,
      onPanel: !props.data.creator.onPanel,
    });
    // props.handlePanel(props.data.creator, !props.data.creator.onPanel);
    // setIsInvited(!isInvited);
  };

  // const gridItemStyles = {
  //   alignSelf: "center",
  // };

  return (
    <Grid
      alignItems={"center"}
      color="white"
      fontSize={"sm"}
      gap={1}
      templateColumns="repeat(5, 1fr)"
    >
      <GridItem colSpan={1} w="70px">
        {isMod && (
          <Tag size="sm" variant="solid" bg="poldit.100">
            Host
          </Tag>
        )}

        {props.isCreator && !isMod && props.startPoll && (
          <Button
            size="xs"
            variant="outline"
            _hover={{
              bg: props.data.creator.onPanel ? "red.200" : "green.200",
              color: "white",
            }}
            _focus={{ outline: "none", bg: "none" }}
            color={props.data.creator.onPanel ? "red.200" : "green.200"}
            onClick={handleInvite}
          >
            {`${props.data.creator.onPanel ? "Remove" : "Invite"}`}
          </Button>
        )}
        {!props.isCreator && props.data.creator.onPanel && !isMod && (
          <Tag bg="green.400" size="sm" variant={"solid"} color="white">
            Panel
          </Tag>
        )}
      </GridItem>
      <GridItem colSpan={3}>
        <HStack spacing="2">
          <UserAvatar data={{ creator: props.data.creator }} size="sm" />
          <Text>{appid}</Text>
        </HStack>
      </GridItem>
      <GridItem colSpan={1}>
        <HStack>
          {props.data.creator.isStreaming && (
            <Icon as={MdVideoCameraFront} boxSize="4" />
          )}
          {props.data.creator.isScreenSharing && (
            <Icon as={CgScreen} boxSize="4" />
          )}
          {props.data.creator.requestInvite && (
            <Icon as={IoHandLeftSharp} boxSize="4" />
          )}
        </HStack>
      </GridItem>
    </Grid>
    // <Box border="1px solid red" color="white" fontSize={"sm"}>
    //   <HStack spacing="2" border="1px solid pink" w="">
    //     <UserAvatar data={{ creator: props.data.creator }} size="sm" />
    //     <Text>{appid}</Text>
    //   </HStack>
    // </Box>
  );

  // return (
  //   <SimpleGrid
  //     columns={props.columns}
  //     spacing={0}
  //     color="white"
  //     fontSize={"sm"}
  //     // w="100%"
  //   >
  //     <Box {...gridItemStyles}>
  //       {isMod && (
  //         <Tag size="sm" variant="solid" bg="poldit.100">
  //           Host
  //         </Tag>
  //       )}
  //       {props.isCreator && !isMod && props.startPoll && (
  //         <Button
  //           size="xs"
  //           variant="outline"
  //           _hover={{
  //             bg: props.data.creator.onPanel ? "red.200" : "green.200",
  //             color: "white",
  //           }}
  //           _focus={{ outline: "none", bg: "none" }}
  //           color={props.data.creator.onPanel ? "red.200" : "green.200"}
  //           onClick={handleInvite}
  //         >
  //           {`${props.data.creator.onPanel ? "Remove" : "Invite"}`}
  //         </Button>
  //       )}
  //       {!props.isCreator && props.data.creator.onPanel && !isMod && (
  //         <Tag bg="green.400" size="sm" variant={"solid"} color="white">
  //           Panel
  //         </Tag>
  //       )}
  //     </Box>
  //     {/* {props.data.creator.isStreaming && <Icon as={MdVideoCameraFront} />}
  //     {props.data.creator.isScreenSharing && <Icon as={CgScreen} />} */}
  //     {/* {props.columns === 4 && ( */}
  //     <Box {...gridItemStyles}>
  //       <HStack>
  //         {props.data.creator.isStreaming && (
  //           <Icon as={MdVideoCameraFront} boxSize="5" />
  //         )}
  //         {props.data.creator.isScreenSharing && (
  //           <Icon as={CgScreen} boxSize="5" />
  //         )}
  //         {props.data.creator.requestInvite && (
  //           <Icon as={IoHandLeftSharp} boxSize="5" />
  //         )}
  //       </HStack>
  //     </Box>
  //     {/* )} */}

  //     <Flex justifyContent={"space-between"} w="100%">
  //       <HStack spacing="3">
  //         <UserAvatar data={{ creator: props.data.creator }} size="sm" />
  //         <Text>{appid}</Text>
  //       </HStack>
  //     </Flex>
  //   </SimpleGrid>
  // );
};
