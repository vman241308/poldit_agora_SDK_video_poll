import {
  Box,
  Text,
  Image,
  Flex,
  CloseButton,
  ButtonGroup,
  Button,
  PopoverContent,
  PopoverArrow,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  AspectRatio,
  useToast,
} from "@chakra-ui/react";
import { EditorState } from "draft-js";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { BiErrorCircle } from "react-icons/bi";
import { LINK_REGEX } from "_components/globalFuncs";
import Video from "../Media/Video";
import { AddMedia } from "../RichText/toolbar";
import CustomToast from "../Toast";

interface FileDrop {
  maxFiles: number;
  close: () => void;
  addMedia: AddMedia;
}

const FileDrop = ({ maxFiles, close, addMedia }: FileDrop) => {
  const toast = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [maxAlert, showMaxAlert] = useState(false);
  const [validVideo, setIsValidVideo] = useState(true);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles,
    onDrop: (acceptedFiles: any) => {
      videoUrl && showMaxAlert(true);
      setFiles(
        acceptedFiles.map((file: any) =>
          Object.assign(file, { preview: URL.createObjectURL(file) })
        )
      );
    },
  });

  //   useEffect(() => {
  //     return () =>
  //       files.forEach((file: any) => URL.revokeObjectURL(file.preview));
  //   }, []);

  const addVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validUrl = e.target.value.match(LINK_REGEX);
    if (validUrl && validUrl.length > 0) {
      setVideoUrl(e.target.value);
      files.length > 0 && showMaxAlert(true);
      return;
    }
    setVideoUrl("");
    e.target.value === "" && showMaxAlert(false);
    // setVideoUrl(e.target.value);
  };

  const clearFile = () => {
    setFiles([]);
    showMaxAlert(false);
  };

  const handleClose = (e: any, isCanceled?: boolean) => {
    if (isCanceled) {
      files.forEach((file: any) => URL.revokeObjectURL(file.preview));
    }
    clearFile();
    setVideoUrl("");
    close();
  };

  const handleSubmit = () => {
    if (!validVideo) {
      toast({
        id: "validVideo",
        duration: 2000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Not a video link!"}
            // msg={"Video link cannot be played.  Please try another link."}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      return;
    }

    if (!maxAlert) {
      files.length > 0 &&
        !videoUrl &&
        addMedia("IMAGE", files[files.length - 1]);
      files.length === 0 &&
        videoUrl &&
        addMedia("VIDEO", { preview: videoUrl, isVideo: true, img: videoUrl });
      handleClose(false);
    }
  };

  // const handleSubmit = () => {
  //   if (!maxAlert) {
  //     files.length > 0 &&
  //       !videoUrl &&
  //       addMedia("IMAGE", files[files.length - 1]);
  //     files.length === 0 &&
  //       videoUrl &&
  //       addMedia("VIDEO", { preview: videoUrl, isVideo: true, img: videoUrl });
  //     handleClose(false);
  //   }
  // };

  const fileLabel = maxFiles > 1 ? "images" : "image";

  return (
    <PopoverContent
      p="3"
      boxShadow="0px 0px 3px 1px rgba(15, 15, 15, 0.17)"
      _active={{ outline: "none" }}
      _focus={{ outline: "none" }}
    >
      <PopoverArrow />
      {maxAlert && (
        <Alert status="error" style={{ height: "35px" }} rounded="md">
          <AlertIcon />
          <Text fontSize={"13px"}>You can only select an image or a video</Text>
        </Alert>
      )}
      <Tabs isFitted>
        <TabList h="25">
          <Tab
            fontSize={"sm"}
            fontWeight="semibold"
            _focus={{ outline: "none" }}
            _selected={{
              color: "poldit.100",
              borderBottom: "2px solid",
            }}
          >
            Image
          </Tab>
          <Tab
            fontSize={"sm"}
            fontWeight="semibold"
            _focus={{ outline: "none" }}
            _selected={{
              color: "poldit.100",
              borderBottom: "2px solid",
            }}
          >
            Video
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ImagePicker
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isDragActive={isDragActive}
              fileLabel={fileLabel}
              files={files}
              clearFile={clearFile}
            />
          </TabPanel>
          <TabPanel>
            <VideoPicker
              addVideo={addVideo}
              video={videoUrl}
              setIsValidVideo={setIsValidVideo}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <ButtonGroup d="flex" justifyContent="flex-end" mt="2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClose}
          _active={{ outline: "none" }}
          _focus={{ outline: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          color="#ff4d00"
          borderColor="#ff4d00"
          _hover={{ bg: "#ff4d00", color: "white" }}
          _active={{ outline: "none" }}
          _focus={{ outline: "none" }}
          size="sm"
          onClick={handleSubmit}
        >
          Add
        </Button>
      </ButtonGroup>
    </PopoverContent>
  );
};

export default FileDrop;

const ImagePicker = ({
  getRootProps,
  getInputProps,
  isDragActive,
  fileLabel,
  files,
  clearFile,
}: any) => (
  <Box {...getRootProps()}>
    <Flex
      bg="gray.100"
      rounded={"md"}
      p="2"
      alignItems={"center"}
      //   h="100px"
    >
      <input {...getInputProps()} />
      <Text
        textAlign="center"
        color="gray.400"
        cursor={"pointer"}
        fontWeight={"semibold"}
      >
        {isDragActive
          ? `Drop your ${fileLabel} here...`
          : `Drag and drop your ${fileLabel} here, or click to select your ${fileLabel}`}
      </Text>
    </Flex>
    <Flex mt="3">
      {files.map((file: any) => (
        <Box
          key={file.name}
          overflow="hidden"
          position="relative"
          rounded={"md"}
          w="100%"
          h="auto"
          maxH="250px"
          bgSize={"contain"}
        >
          <CloseButton
            position={"absolute"}
            _active={{ outline: "none" }}
            _focus={{ outline: "none" }}
            bg="gray.200"
            right="2"
            top="2"
            _hover={{ bg: "gray.300" }}
            onClick={clearFile}
          />
          <Image src={file.preview} objectFit={"fill"} />
        </Box>
      ))}
    </Flex>
  </Box>
);

const VideoPicker = ({ addVideo, video, setIsValidVideo }: any) => (
  <Box>
    <FormControl>
      <Textarea
        fontSize={"sm"}
        id="video-link-input"
        placeholder="Video Link"
        onChange={addVideo}
      />
    </FormControl>
    <Box mt="3" h="200px">
      {video && <Video url={video} setIsValidVideo={setIsValidVideo} />}
    </Box>
  </Box>
);
