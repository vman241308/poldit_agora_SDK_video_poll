import { HStack, Tooltip } from "@chakra-ui/react";
import { BiVideo } from "react-icons/bi";
import { BsImage, BsLink45Deg } from "react-icons/bs";
import { Answer } from "_components/appTypes/appType";
import { getLinks } from "_components/pageComponents/Editor/richTxtOut";

interface AnswerContentIcons {
  answer: string;
}

const AnswerContentIcons = ({ answer }: AnswerContentIcons) => {
  const btnStyle = { size: "16px", color: "#4299E1" };

  const nodes = JSON.parse(answer);
  const numLinks = getLinks(nodes).length;
  const numImgs = nodes.filter((x: any) => x.type === "image").length;
  const numVids = nodes.filter((x: any) => x.type === "video").length;

  return (
    <HStack spacing="4">
      {numLinks > 0 && (
        <Tooltip label="Contains Link" placement="top" hasArrow rounded="md">
          <span>
            <BsLink45Deg {...btnStyle} />
          </span>
        </Tooltip>
      )}

      {numImgs > 0 && (
        <Tooltip label="Contains Image" placement="top" hasArrow rounded="md">
          <span>
            <BsImage {...btnStyle} />
          </span>
        </Tooltip>
      )}

      {numVids > 0 && (
        <Tooltip label="Contains Video" placement="top" hasArrow rounded="md">
          <span>
            <BiVideo {...btnStyle} />
          </span>
        </Tooltip>
      )}
    </HStack>
  );
};

export default AnswerContentIcons;
