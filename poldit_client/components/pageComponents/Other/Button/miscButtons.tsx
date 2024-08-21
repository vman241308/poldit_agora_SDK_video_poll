import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Portal,
  Flex,
  Text,
} from "@chakra-ui/react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { RiCloseFill } from "react-icons/ri";

interface InfoBtn {
  msgTxt: string;
  size: string;
  placement: any;
  onModal?: boolean;
  msgSize?: string;
}

export const InfoBtn = ({
  msgTxt,
  size,
  placement,
  onModal,
  msgSize,
}: InfoBtn) => (
  <Popover placement={placement} isLazy>
    <PopoverTrigger>
      <IconButton
        aria-label="info-mssg"
        size="xs"
        isRound
        p="0"
        icon={<AiOutlineInfoCircle size={size} />}
        bg="none"
        _focus={{ outline: "none", bg: "none" }}
        _active={{ bg: "none" }}
      />
    </PopoverTrigger>
    <InfoMssg mssg={msgTxt} onModal={onModal} msgSize={msgSize} />
  </Popover>
);

interface InfoMssg {
  mssg: string;
  onModal: boolean | undefined;
  msgSize: string | undefined;
}

const InfoMssg = ({ mssg, onModal, msgSize }: InfoMssg) => {
  return (
    <>
      {onModal ? (
        <PopoverContent
          _focus={{ outline: "none" }}
          w="200px"
          borderRadius="lg"
          zIndex={"modal"}
        >
          <PopoverArrow bg="black" />
          <PopoverBody bg="black" color="white" rounded={"md"}>
            <Text fontSize={msgSize ? msgSize : "med"}>{mssg}</Text>
          </PopoverBody>
        </PopoverContent>
      ) : (
        <Portal>
          <PopoverContent
            _focus={{ outline: "none" }}
            w="200px"
            borderRadius="lg"
            zIndex={"modal"}
          >
            <PopoverArrow bg="black" />
            <PopoverBody bg="black" color="white" rounded={"md"}>
              <Text fontSize="med">{mssg}</Text>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      )}
    </>
  );
};

interface ICloseBtnProps {
  close: any;
  iconSize: string;
  btnSize: string;
}

export const CloseBtn_custom = ({
  close,
  iconSize,
  btnSize,
}: ICloseBtnProps) => (
  <IconButton
    aria-label="Call Sage"
    size={btnSize}
    fontSize={iconSize}
    rounded="md"
    icon={<RiCloseFill />}
    onClick={close}
  />
);
