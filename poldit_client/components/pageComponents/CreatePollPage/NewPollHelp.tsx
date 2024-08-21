import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";

export const NewPollHelp: React.FC<{}> = () => {
  return (
    <Box pl={{ base: 0, lg: 8 }} mb={{ base: 6, lg: 0 }}>
      <Box
        border="1px solid #d6d9dc"
        boxShadow="0 1px 2px hsla(0,0%,0%,0.05),0 1px 4px hsla(0,0%,0%,0.05),0 2px 8px hsla(0,0%,0%,0.05)"
      >
        <Accordion allowToggle defaultIndex={[0, 1, 2]} allowMultiple={true}>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg="#f8f9f9"
                _focus={{ outline: "none" }}
                _hover={{ bg: "#f8f9f9" }}
              >
                <Box flex="1" textAlign="left">
                  <Text fontSize="md" fontWeight="bold">
                    Question type
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} bg="white" px="0">
                <Box px="4" pt="2" pb="4">
                  <UnorderedList>
                    <ListItem color="gray.500" fontSize="sm">
                      Open ended: Users will answer your question with their own
                      answers.
                    </ListItem>
                    <ListItem color="gray.500" fontSize="sm" mt="2">
                      Multiple choice: you will add 2-5 answers for people to
                      choose from.
                    </ListItem>
                  </UnorderedList>
                </Box>
              </AccordionPanel>
            </h2>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg="#f8f9f9"
                _focus={{ outline: "none" }}
                _hover={{ bg: "#f8f9f9" }}
              >
                <Box flex="1" textAlign="left">
                  <Text fontSize="md" fontWeight="bold">
                    Ask a Poll Question
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} bg="white" px="0">
                <Box px="4" pt="2" pb="4">
                  <UnorderedList>
                    <ListItem color="gray.500" fontSize="sm">
                      Keep your question short and clear!
                    </ListItem>
                    <ListItem color="gray.500" fontSize="sm" mt="2">
                      Check to see if your question has been asked yet by
                      searching. If it has, check out the answers and reopen the
                      chat if you’d like to discuss.
                    </ListItem>
                    <ListItem color="gray.500" fontSize="sm" mt="2">
                      Be cool! No hate speech, threats, harassment, or questions
                      relating to politics, religion, or anything that could
                      lead to violence, terrorism, or other bad things.
                    </ListItem>
                  </UnorderedList>
                </Box>
              </AccordionPanel>
            </h2>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg="#f8f9f9"
                _focus={{ outline: "none" }}
                _hover={{ bg: "#f8f9f9" }}
              >
                <Box flex="1" textAlign="left">
                  <Text fontSize="md" fontWeight="bold">
                    Poll Topics and Subtopics
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} bg="white" px="0">
                <Box px="4" pt="2" pb="4">
                  <UnorderedList>
                    <ListItem color="gray.500" fontSize="sm">
                      Once you select a main topic, it’s associated subtopics
                      will appear. You will need to select 1 topic and 1-3
                      subtopic(s) for your poll. If you don’t see a relevant
                      subtopic you may create a new one!
                    </ListItem>
                  </UnorderedList>
                </Box>
              </AccordionPanel>
            </h2>
          </AccordionItem>
        </Accordion>
      </Box>
      {/* <Box
        border="1px solid #d6d9dc"
        boxShadow="0 1px 2px hsla(0,0%,0%,0.05),0 1px 4px hsla(0,0%,0%,0.05),0 2px 8px hsla(0,0%,0%,0.05)"
        mt="4"
        display={{ base: "none", lg: "block" }}
      >
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton
                bg="#f8f9f9"
                _focus={{ outline: "none" }}
                _hover={{ bg: "#f8f9f9" }}
              >
                <Box flex="1" textAlign="left">
                  <Text fontSize="md" color="gray.500">
                    More helpful links
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg="white">
              <Text fontSize="sm" color="gray.600">
                The community is here to help you with specific coding,
                algorithm, or language problems.
              </Text>
              <Text
                fontSize="sm"
                color="blue.300"
                mt="2"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                Visit the help center
              </Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box> */}
    </Box>
  );
};
