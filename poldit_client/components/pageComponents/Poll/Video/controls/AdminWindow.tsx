import {
  Box,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Tag,
  Text,
  Tooltip,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  BsCameraVideoFill,
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
} from "react-icons/bs";
import { IconType } from "react-icons/lib";
import {
  MdAdminPanelSettings,
  MdScreenShare,
  MdStopScreenShare,
} from "react-icons/md";
import { VscMute, VscUnmute } from "react-icons/vsc";
import {
  EnumModMssg,
  IUserPresence,
} from "_components/hooks/channel/useChannel";
import { INavControlProps } from "./NavControls";

interface Props extends INavControlProps {
  btnStyles: any;
  mod: IUserPresence;
}

interface IModBtn {
  btnLabel: EnumModMssg;
  trueLabel: string;
  falseLabel?: string;
  state: boolean;
  TrueIcon?: IconType;
  FalseIcon?: IconType;
}

type THandleBtn = (btn: EnumModMssg) => void;

const modBtns: IModBtn[] = [
  {
    btnLabel: "mute",
    trueLabel: "Mute All",
    falseLabel: "Unmute All",
    state: false,
    TrueIcon: VscMute,
    FalseIcon: VscUnmute,
  },
  {
    btnLabel: "video",
    trueLabel: "Disable All Video",
    falseLabel: "Enable All Video",
    state: false,
    TrueIcon: BsFillCameraVideoOffFill,
    FalseIcon: BsCameraVideoFill,
  },
  //   {
  //     btnLabel: "screen_share",
  //     trueLabel: "Disable All Screen Share",
  //     falseLabel: "Enable All Screen Share",
  //     state: false,
  //     TrueIcon: MdStopScreenShare,
  //     FalseIcon: MdScreenShare,
  //   },
  {
    btnLabel: "remove_panel",
    trueLabel: "Remove Panel",
    state: false,
  },
  { btnLabel: "end_poll", trueLabel: "End Poll", state: false },
];

function AdminWindow(props: Props) {
  const [btns, setBtns] = useState<IModBtn[]>(modBtns);

  const handleBtn: THandleBtn = (btn) => {
    props.msgChannel.publishToChannel("Moderator Control", {
      ...props.mod,
      modMssg: btn,
      panel: props.msgChannel.panelMembers,
    });

    setBtns((prev) =>
      prev.map((x) => (x.btnLabel === btn ? { ...x, state: !x.state } : x))
    );

    btn === "end_poll" && props.msgChannel.updatePollHistory("Poll Ended");
  };

  return (
    <>
      <Popover placement="top">
        <PopoverTrigger>
          <IconButton
            {...props.btnStyles}
            aria-label={"adminCtrl"}
            icon={<MdAdminPanelSettings />}
          />
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            border="1px solid white"
            overflow={"hidden"}
            w="200px"
            _focus={{ outline: "none" }}
          >
            <PopoverArrow bg="gray.700" />
            <PopoverBody bg="gray.700" p="0">
              <Stack p="2">
                {btns.map((x, idx) => (
                  <ModBtn key={idx} btnVal={x} handleBtn={handleBtn} />
                ))}
              </Stack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
}

export default AdminWindow;

interface IModBtnProps {
  btnVal: IModBtn;
  handleBtn: THandleBtn;
}

const ModBtn = ({ btnVal, handleBtn }: IModBtnProps) => {
  const { TrueIcon, btnLabel, trueLabel, falseLabel, FalseIcon, state } =
    btnVal;

  const btnStyles = {
    color: "white",
    variant: "ghost",
    size: "xs",
    fontSize: "16px",
    _hover: { color: "poldit.100", border: "1px" },
    _focus: { outline: "none" },
  };

  return (
    <>
      {TrueIcon && FalseIcon ? (
        <HStack fontSize={"xs"} color="white">
          <IconButton
            aria-label={btnVal.btnLabel}
            icon={!state ? <TrueIcon /> : <FalseIcon />}
            {...btnStyles}
            onClick={() => handleBtn(btnLabel)}
          />
          <Text>{!state ? trueLabel : falseLabel}</Text>
        </HStack>
      ) : (
        <Button
          variant="outline"
          color="#ff4d00"
          borderColor="#ff4d00"
          onClick={() => handleBtn(btnLabel)}
          _hover={{ bg: "#ff4d00", color: "white" }}
          _active={{ outline: "none" }}
          _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
          size="xs"
        >
          {trueLabel}
        </Button>
      )}
    </>
    // <HStack fontSize={"xs"} color="white">
    //   {TrueIcon ? (
    //     <IconButton
    //       aria-label={btnVal.btnLabel}
    //       icon={<TrueIcon />}
    //       {...btnStyles}
    //     />
    //   ) : (
    //     <Button {...btnStyles}>{state ? trueLabel : falseLabel}</Button>
    //   )}
    //   <Text>{state ? trueLabel : falseLabel}</Text>
    // </HStack>
  );
};
