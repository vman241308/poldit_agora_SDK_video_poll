import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
  RawDraftContentState,
} from "draft-js";
import { updatePoll } from "lib/apollo/apolloFunctions/mutations";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getSecureImgLinks } from "_components/globalFuncs/apiHelpers";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  withEmbeds,
  withInlines,
} from "_components/pageComponents/Editor/plugins";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import CustomToast from "_components/pageComponents/Other/Toast";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { HandleEdit } from ".";
// import RichTxtEditor from "_components/pageComponents/Other/RichText";

const PolditEditor = dynamic(
  () => import("_components/pageComponents/Editor"),
  {
    ssr: false,
  }
);

const txtMax = 1000;
const mediaMax = 3;

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

interface EditArea {
  data: string;
  pollId: string;
  editPoll: HandleEdit;
  onClose: () => void;
  userId: string;
}

const Edit = ({ data, pollId, editPoll, onClose, userId }: EditArea) => {
  const toast = useToast();

  const [editor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );

  const [editorValue, setEditorValue] = useState(
    data.startsWith('[{"type":') ? JSON.parse(data) : initialValue
  );
  const [disableSubmit, setDisableSubmit] = useState(true);

  const [selectedImgs, setSelectImgs] = useState<any>([]);

  const handleEditorUpdates = (nodes: Descendant[]) => {
    const isEditorTxtSame = CustomEditor.hasEditorChanged(data, nodes);

    setDisableSubmit(isEditorTxtSame);
  };

  const handleUpdateQuestion = async () => {
    const content = CustomEditor.getPlainText(editor.children);

    if (content.length === 0) {
      toast({
        id: "fieldEmpty",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Question field cannot be empty"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });

      return;
    }
    let contentState: any = editor.children;
    const securedImgs: string[] = [];

    contentState = await Promise.all(
      contentState.map(async (x: any) => {
        if (x.type === "image") {
          const imgMatch = selectedImgs.filter(
            (img: any) => img.name === x.name
          );
          if (imgMatch.length > 0) {
            const url: any = await getSecureImgLinks(imgMatch, userId, "poll");
            securedImgs.push(url[0].img);
            return { ...x, url: url[0].img };
          }
        }
        return x;
      })
    );

    const pollMedia = contentState
      .filter((x: any) => ["image", "video"].includes(x.type))
      .map((y: any) => JSON.stringify(y));

    const editQ = {
      _id: pollId,
      question: JSON.stringify(contentState),
      pollImages: pollMedia,
    };

    editPoll(editQ);
  };

  return (
    <Box p="5">
      <PolditEditor
        styles={{
          border: "1px solid #DAE1E4",
          borderRadius: "5px",

          overflow: "auto",
        }}
        inputData={{
          txtMax,
          editorType: "Edit Question",
          mediaMax,
          placeholderTxt: "",
          minHeight: "150px",
          maxHeight: "400px",
          imgs: selectedImgs,
          editor: editor,
          input: editorValue,
          updateInput: handleEditorUpdates,
          updateImgs: setSelectImgs,
        }}
      />

      <Flex w="100%" justify="flex-end" align="center" mt="4" pr="1">
        <Button
          disabled={disableSubmit}
          bg="poldit.100"
          color="white"
          size="sm"
          border="1px"
          mr="2"
          onClick={handleUpdateQuestion}
          _hover={{ bg: "poldit.100", color: "white" }}
          _focus={{ outline: "none" }}
          //   isLoading={editLoading}
          _active={{
            bg: "white",
            color: "poldit.100",
            borderColor: "poldit.100",
          }}
        >
          Update
        </Button>
        <Button
          size="sm"
          colorScheme="blackAlpha"
          onClick={onClose}
          _focus={{ outline: "none" }}
        >
          Cancel
        </Button>
      </Flex>
    </Box>
  );
};

export default Edit;
