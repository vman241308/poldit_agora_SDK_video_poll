import { Box, PopoverArrow, PopoverContent, Text } from "@chakra-ui/react";
import { useState } from "react";
// import Picker, { IEmojiData } from "emoji-picker-react";

interface EmojiPicker {
  close: () => void;
}

const EmojiPicker = ({ close }: EmojiPicker) => {
  // const [chosenEmoji, setChosenEmoji] = useState<IEmojiData | null>(null);

  // const onEmojiClick = (e: any, emoji: IEmojiData) => {
  //   console.dir(emoji);
  //   setChosenEmoji(emoji);
  //   close();
  // };

  return (
    <PopoverContent
      boxShadow="0px 0px 3px 1px rgba(15, 15, 15, 0.17)"
      _active={{ outline: "none" }}
      _focus={{ outline: "none" }}
    >
      <PopoverArrow />
      <Box>
        {/* <Picker onEmojiClick={onEmojiClick} pickerStyle={{ width: "100%" }}  /> */}
      </Box>

      {/* <Box>
          <Text dangerouslySetInnerHTML={{__html: "&#128512"}}></Text>
        {"&#128512"}
      </Box> */}
    </PopoverContent>
  );
};

export default EmojiPicker;
