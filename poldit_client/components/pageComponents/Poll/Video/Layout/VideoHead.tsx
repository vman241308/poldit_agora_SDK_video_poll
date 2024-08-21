import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import MediaPreview from "_components/pageComponents/Other/Media/MediaPreview";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import { EditQ, PollCardHeader } from "../../Question";
import Edit from "../../Question/Edit";
import { IVideoHeadProps } from "../video";

const VideoHead = (props: IVideoHeadProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [showCard, setShowCard] = useState<boolean>(false);

  const handleToggle = () => setShowCard(!showCard);

  const editPollQ = (question: EditQ) => {
    props.handleEdit(question);
    props.update(question.question);
    onClose();
  };

  return (
    <>
      <Box pl="2" pt="4" pb="4">
        <PollCardHeader
          creator={props.pollData?.creator}
          creationDate={props.pollData?.creationDate}
          onOpen={onOpen}
          isEditable={props.pollData?.isEditable}
          isMyPoll={props.pollData?.isMyPoll}
          pollId={props.pollData?._id}
          isActive={props.pollData?.isActive}
          loggedIn={props.user?._id ? true : false}
          report={props.report}
        />
      </Box>
      <Box pb="3" pl="2" pr="2">
        {props.question && !isOpen ? (
          <Box>
            <RichTxtOut
              contentType="Poll Question"
              content={props.question}
              // content={pollData?.question}
              show={showCard}
              cardToggle={handleToggle}
              // txtStyle={{ pl: "25px", pr: "25px" }}
            />
            {!showCard ? (
              <Flex mt="2" align="center" pl="25px">
                {props.pollData?.pollImages.map((x, idx) => (
                  <MediaPreview key={idx} media={x} />
                ))}
              </Flex>
            ) : null}
          </Box>
        ) : (
          <Edit
            data={props.question}
            pollId={props.pollData._id}
            editPoll={editPollQ}
            onClose={onClose}
            userId={props.userId}
          />
        )}
      </Box>
    </>
  );
};

export default VideoHead;
