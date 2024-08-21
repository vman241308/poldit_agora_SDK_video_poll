import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Box,
  useToast,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { updateAnswer } from "lib/apollo/apolloFunctions/mutations";
import { Answer } from "_components/appTypes/appType";
import dynamic from "next/dynamic";
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
import { getSecureImgLinks } from "_components/globalFuncs/apiHelpers";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const PolditEditor = dynamic(
  () => import("_components/pageComponents/Editor"),
  {
    ssr: false,
  }
);

const txtMax = 1000;
const mediaMax = 1;

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

interface EditAnsModal {
  isEditOpen: boolean;
  onEditClose: () => void;
  ansData: Answer;
  pollId: string;
  userId: string;
}

const EditAnsModal = ({
  isEditOpen,
  onEditClose,
  ansData,
  pollId,
  userId,
}: EditAnsModal) => {
  const toast = useToast();

  const [editor] = useState(() =>
    withReact(withHistory(withEmbeds(withInlines(createEditor()))))
  );

  const [selectedImgs, setSelectImgs] = useState<any>([]);
  const [editorValue, setEditorValue] = useState(initialValue);

  const [disableSubmit, setDisableSubmit] = useState(true);

  const { UPDATE_ANSWER } = GraphResolvers.mutations;
  const [editAnswer, { loading: editAnswerLoading, error }] =
    useMutation(UPDATE_ANSWER);

  useEffect(() => {
    if (ansData.answer.startsWith('[{"type":')) {
      const nodes = JSON.parse(ansData.answer);
      setSelectImgs([ansData.answerImage]);
      setEditorValue(nodes);
    }
  }, [ansData]);

  const submitAnswer = async () => {
    const content = CustomEditor.getPlainText(editor.children);

    if (content.length === 0) {
      toast({
        id: "fieldEmpty",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Answer field cannot be empty"}
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

    const answerImg = contentState.filter((x: any) =>
      ["image", "video"].includes(x.type)
    );

    const editA = {
      ...ansData,
      answer: JSON.stringify(contentState),
      answerImage:
        answerImg && answerImg.length > 0 && answerImg[0].url
          ? answerImg[0].url
          : "",
      // answerImage: securedImgs.length ? selectedImgs[0] : "",
    };
    try {
      const resp = await editAnswer({
        variables: { details: JSON.stringify(editA) },
      });
      // const resp = await updateAnswer(editAnswer, JSON.stringify(editA));
      if (resp) {
        toast({
          id: "answerUpdated",
          duration: 3000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={"Answer updated successfully"}
              bg={"green.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={IoCheckmarkCircleOutline}
            />
          ),
        });
      }
      onEditClose();
    } catch (err: any) {
      toast({
        id: "editError",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={err.message}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  };

  const handleEditorUpdates = (nodes: Descendant[]) => {
    const isEditorTxtSame = CustomEditor.hasEditorChanged(
      ansData.answer,
      nodes
    );

    setDisableSubmit(isEditorTxtSame);
  };

  // const getPlainText = (contentState: ContentState) => {
  //   const textVal = contentState.getPlainText();
  //   setAnswer(textVal);
  // };

  return (
    <Modal
      isOpen={isEditOpen}
      onClose={onEditClose}
      size={"3xl"}
      trapFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Answer</ModalHeader>
        <ModalBody>
          <Box position="relative">
            <PolditEditor
              styles={{
                border: "1px solid #DAE1E4",
                borderRadius: "5px",
                // maxHeight: "400px",
                // minHeight: "400px",
                overflow: "auto",
              }}
              inputData={{
                txtMax,
                editorType: "Edit Answer",
                mediaMax,
                placeholderTxt: "",
                minHeight: "150px",
                maxHeight: "400px",
                imgs: selectedImgs,
                editor: editor,
                input: editorValue,
                updateInput: handleEditorUpdates,
                updateImgs: setSelectImgs,
                // toggleSubmit: hasEditorChanged,
              }}
            />

            {/* <CustomEditor
              setVal={setAnswer}
              editorState={editorState}
              setEditorState={setEditorState}
              updateImg={setSelectImgs}
              inputData={{
                imgMax: 1,
                txtMax: 400,
                imgs: selectedImgs,
                inputTxt: answer,
              }}
              styles={{
                maxHeight: "400px",
                minHeight: "400px",
                overflow: "auto",
              }}
            /> */}
            <Flex justifyContent="flex-end" mr="5" pb="3" mt="4">
              <Button
                mr="6"
                disabled={disableSubmit}
                variant="outline"
                size="sm"
                color="poldit.100"
                borderColor="poldit.100"
                _hover={{ bg: "poldit.100", color: "white" }}
                _active={{ outline: "none" }}
                _focus={{ outline: "none" }}
                onClick={submitAnswer}
              >
                Submit
              </Button>
              <Button
                size="sm"
                variant="outline"
                color="gray.500"
                borderColor={"gray.800"}
                _active={{ outline: "none" }}
                _focus={{ outline: "none" }}
                onClick={onEditClose}
              >
                Cancel
              </Button>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditAnsModal;
