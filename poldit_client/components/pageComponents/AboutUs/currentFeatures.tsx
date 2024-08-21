import {
  Text,
  Box,
  ListItem,
  ListIcon,
  List,
  Flex,
  Stack,
  Collapse,
  Accordion,
  AccordionItem,
  AccordionButton,
  Icon,
  AccordionPanel,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { MdSettings } from "react-icons/md";
import { currentFeaturesData } from "./data";

const currentFeatures = () => {
  const [data, setData] = useState(currentFeaturesData);

  const handleData = (itemIdx: number) => {
    const updatedData = data.map((x, idx) => {
      if (idx === itemIdx) {
        return { ...x, isOpen: !x.isOpen };
      }
      return { ...x, isOpen: false };
    });

    setData(updatedData);
  };

  return (
    <Stack spacing={"3"}>
      {data.map((item, idx) => (
        <Flex
          key={idx}
          p="5"
          cursor={"pointer"}
          bg="gray.200"
          flexDir={"column"}
        >
          <Flex alignItems={"center"} justifyContent="space-between">
            <Text
              color="gray.500"
              fontSize={["md", "md", "lg"]}
              _hover={{ color: "gray.700" }}
            >
              {item.area}
            </Text>
            <IconButton
              aria-label={"areaBtn"}
              p="0"
              variant="ghost"
              _focus={{ outline: "none" }}
              onClick={() => handleData(idx)}
              rounded="md"
              icon={item.isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
            />
          </Flex>
          <Collapse in={item.isOpen} animateOpacity>
            <Stack p="3" rounded="md" spacing="2">
              {item.features.map((x, subIdx) => (
                <Accordion key={subIdx} allowMultiple allowToggle>
                  <AccordionItem>
                    {({ isExpanded }) => (
                      <>
                        {x.bullets.length > 0 ? (
                          <h2>
                            <AccordionButton
                              _focus={{ outline: "none" }}
                              rounded="md"
                            >
                              <Box flex="1" textAlign="left" fontSize={"16px"}>
                                {x.description}
                              </Box>
                              {isExpanded ? (
                                <Icon as={AiOutlineMinus} w={4} h={4} />
                              ) : (
                                <Icon as={AiOutlinePlus} w={4} h={4} />
                              )}
                            </AccordionButton>
                          </h2>
                        ) : (
                          <AccordionButton
                            _focus={{ outline: "none" }}
                            rounded="md"
                          >
                            <Box flex="1" textAlign="left" fontSize={"16px"}>
                              {x.description}
                            </Box>
                          </AccordionButton>
                        )}
                        <AccordionPanel pb={4}>
                          <List spacing={3}>
                            {x.bullets.map((y, yIdx) => (
                              <ListItem
                                key={yIdx}
                                ml="6"
                                display={"flex"}
                                alignItems="center"
                              >
                                <ListIcon as={MdSettings} color="poldit.100" />
                                <Text fontSize={"14px"} color="gray.500">
                                  {y}
                                </Text>
                              </ListItem>
                            ))}
                          </List>
                        </AccordionPanel>
                      </>
                    )}
                  </AccordionItem>
                </Accordion>
              ))}
            </Stack>
          </Collapse>
        </Flex>
      ))}
    </Stack>
  );
};

export default currentFeatures;
