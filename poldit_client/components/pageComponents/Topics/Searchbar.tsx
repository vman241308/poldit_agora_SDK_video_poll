import { Box, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import React from "react";
import { BiSearch } from "react-icons/bi";
import { TSearch } from "./topic_types";

interface IProps {
  search: TSearch;
}

const Searchbar = (props: IProps) => {
  return (
    <Box mb="5">
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          children={<BiSearch size="20" />}
          h="100%"
        />
        <Input
          size="md"
          id="searchTxt"
          placeholder="Search topics and subtopics"
          borderColor="gray.300"
          borderRadius="md"
          onChange={props.search}
        />
      </InputGroup>
    </Box>
  );
};

export default Searchbar;
