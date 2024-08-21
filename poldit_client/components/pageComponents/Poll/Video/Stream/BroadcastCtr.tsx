import { Box, Center, Flex, Spinner } from "@chakra-ui/react";
import React from "react";
import {
  IBroadCastData,
  TPublishToChannel,
} from "_components/hooks/channel/useChannel";
import GraphResolvers from "_apiGraphStrings/index";
import { useQuery } from "@apollo/client";
import { PollCardHeader } from "../../Question";
import { StaticContentHeader } from "../Layout/ContentCard";
import Scrollbars from "_components/pageComponents/Other/Scrollbar";
import { TUpdatePoll } from "_components/hooks/hooks";

interface Props {
  isHost: boolean;
  bData: IBroadCastData;
  broadcast: TPublishToChannel;
  update: TUpdatePoll;
}

function BroadcastCtr({ bData, broadcast, update, isHost }: Props) {
  const { data, loading, error } = useQuery(
    GraphResolvers.queries.GET_BROADCAST_CONTENT,
    {
      variables: { _id: bData._id, contentType: bData.contentType },
    }
  );

  const closeBroadcast = () => {
    broadcast("Broadcast", { ...bData, remove: true });
    update(bData._id, "isBroadcasted", false);
  };

  return (
    <Center
      position="absolute"
      bottom="20"
      //   ml="20"
      //   mr="20"
      w="100%"
    >
      {data && (
        <Flex
          justify="center"
          align="center"
          bg="white"
          color="gray.700"
          rounded="md"
          w="70%"
          //   maxH="150px"
          //   maxW="80%"
          overflow={"hidden"}
        >
          <Scrollbars
            style={{
              height: "150px",
              width: "100%",
              padding: "10px",
              paddingRight: "15px",
            }}
          >
            <StaticContentHeader
              question={data.getSpecificContent.content.question}
              creationDate={data.getSpecificContent.content.creationDate}
              creator={data.getSpecificContent.content.creator}
              close={closeBroadcast}
              isHost={isHost}
            />
          </Scrollbars>
        </Flex>
      )}
    </Center>
  );
}

export default BroadcastCtr;
