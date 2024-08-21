import { Box, Input, Tooltip } from "@chakra-ui/react";
import { useRef } from "react";
import { RiCamera2Line } from "react-icons/ri";
import { SelectedImage } from "_components/appTypes/appType";
import { imgPickerHandler } from "_components/formFuncs/miscFuncs";

interface ImgInput {
  imgSize: string;
  handleImg: any;
  userId: string;
  required: boolean;
  imgId: string;
  imageName?: string;
}

const singleImgPick = ({
  imgSize,
  handleImg,
  userId,
  required,
  imgId,
  imageName,
}: ImgInput) => {
  const inputRef = useRef(null);

  const imgSelectHandler = (e: any) => {
    const fileObjList: File[] = Array.from(e.target?.files);
    const fileURL = URL.createObjectURL(fileObjList[0]);

    const pickedImg: SelectedImage = {
      imageName: imageName ? imageName : fileObjList[0].name.split(".")[0],
      image: fileObjList[0],
      imageUri: fileURL,
      userId: userId,
      imgType: "profile",
    };

    handleImg(pickedImg);
  };

  return (
    <Box onClick={() => imgPickerHandler(inputRef)}>
      <RiCamera2Line size={imgSize} color="#ff4d00" />
      <Input
        type={"file"}
        id={imgId}
        display={"none"}
        accept="image/*"
        ref={inputRef}
        onChange={imgSelectHandler}
        isRequired={required}
      />
    </Box>
  );
};

export default singleImgPick;
