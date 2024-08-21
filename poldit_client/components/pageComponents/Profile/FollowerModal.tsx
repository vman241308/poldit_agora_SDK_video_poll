import {
  Avatar,
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Follower } from "_components/appTypes/appType";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { FollowBtn_Lg } from "../Other/Button/Follow";

interface FollowerModal {
  isOpen: boolean;
  onClose: () => void;
  data: any[] | undefined;
  followType: string;
  userId: string;
  isMe: boolean;
}

export const FollowerModal = ({
  isOpen,
  onClose,
  data,
  followType,
  userId,
  isMe,
}: FollowerModal) => {
  //Cosmetic only, doesnt actually follow or unfollow

  return (
    <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader alignItems="center" borderBottom="1px solid #dbdbdb" p="2">
          {followType === "follower" ? "Followers" : "Following"}
        </ModalHeader>
        <ModalCloseButton _focus={{ outline: "none" }} />
        <ModalBody maxH="600px">
          {!data ? (
            <Flex justify="center" align="center" minH="500px">
              <Spinner size="lg" color="poldit.100" />
            </Flex>
          ) : (
            <Box>
              {data.map((x) => (
                <Box key={x._id} mb="4">
                  <Flex align="center" justify="space-between">
                    <Flex align="center">
                      <Box position={"relative"}>
                        <Link href={`/Profile/${x.appId}`}>
                          <Avatar
                            name={`${x.firstname} ${x.lastname}`}
                            src={x.profilePic}
                            border="none"
                            cursor="pointer"
                            bg="gray.500"
                            color="white"
                          />
                        </Link>
                        {x.isActive && (
                          <Tooltip
                            label="Active"
                            hasArrow
                            placement="right-end"
                            fontSize={"xs"}
                          >
                            <Box
                              position="absolute"
                              w="10px"
                              h="10px"
                              borderRadius="50%"
                              bg="green.300"
                              bottom="1"
                              right="1px"
                            ></Box>
                          </Tooltip>
                        )}
                      </Box>
                      <Box ml="3">
                        <Text fontSize="sm" fontWeight="bold">
                          {x.appId}
                        </Text>
                      </Box>
                    </Flex>
                    {isMe && (
                      <Box>
                        <FollowBtn_Lg user={x} appId={userId} />
                      </Box>
                    )}
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
