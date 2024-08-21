import { useQuery } from "@apollo/client";
import {
  LinkBox,
  LinkOverlay,
  Box,
  Heading,
  Text,
  Image,
  Spinner,
  Flex,
  AspectRatio,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { CloseBtn_custom } from "../Button/miscButtons";
import TimeAgo from "react-timeago";

interface CustomLink {
  link: string;
  close?: () => void;
}

interface LinkMetadata {
  title: string;
  favicon: string;
  description: string;
  image: string;
  author: string;
}

const CustomLink = ({ link, close }: CustomLink) => {
  const { data, loading, error } = useQuery(
    GraphResolvers.queries.GET_LINK_METADATA,
    {
      variables: { link },
    }
  );

  if (error) {
    return null;
  }

  return (
    <LinkBox
      as="article"
      w="100%"
      // w={{ sm: "100%", md: "100%", lg: "100%" }}
      borderWidth="1px"
      position={"relative"}
      h={"auto"}
      // boxShadow="1px 1px 6px -1px rgba(0,0,0,.2)"
      overflow={"hidden"}
    >
      {close && (
        <Box position="absolute" zIndex={"5"} right="2" top="2">
          <CloseBtn_custom close={close} iconSize={"24px"} btnSize="sm" />
        </Box>
      )}
      {loading ? (
        <Flex justifyContent={"center"} alignItems="center" h="100%">
          <Spinner size="lg" color="poldit.100" />
        </Flex>
      ) : (
        <>
          {data?.getLinkMetaData.image && (
            <AspectRatio height="150" w="100%" ratio={4 / 3}>
              <Image src={data?.getLinkMetaData.image} />
            </AspectRatio>
          )}
          <Stack p="2" whiteSpace={"normal"}>
            <Box as="time" bg="gray">
              <Text fontSize={"sm"} fontWeight="semibold" color="gray.500">
                <TimeAgo
                  date={data?.getLinkMetaData.datePublished ?? ""}
                  live={false}
                />
              </Text>
            </Box>
            <Heading fontSize={"18px"} my="2">
              <LinkOverlay href={link} isExternal>
                <Text noOfLines={2}>{data?.getLinkMetaData.title ?? link}</Text>
              </LinkOverlay>
            </Heading>
            <Text
              noOfLines={2}
              fontSize={"13px"}
              color="gray.500"
            >
              {data?.getLinkMetaData.description ?? link}
            </Text>
          </Stack>
        </>
      )}
    </LinkBox>
  );
};

export default CustomLink;
