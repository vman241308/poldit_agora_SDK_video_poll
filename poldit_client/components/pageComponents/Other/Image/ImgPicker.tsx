import React, { useRef } from "react";
import { SelectedImage } from "../../../appTypes/appType";
import styles from "../../../../appStyles/appStyles.module.css";
import { imgPickerHandler } from "../../../formFuncs/miscFuncs";
import { RiCamera2Line } from "react-icons/ri";
import { IoIosClose } from "react-icons/io";
import { useAuth } from "../../../authProvider/authProvider";
import { ToolTipCtr } from "../../../layout/customComps";
import { useToast } from "@chakra-ui/react";

interface ImgPicker {
  selectedImgs: SelectedImage[];
  selectImgs: (imgList: SelectedImage[]) => void;
  imageLimit: number;
  imgsize?: string;
}

const ImgPicker = ({
  selectedImgs,
  selectImgs,
  imageLimit,
  imgsize,
}: ImgPicker) => {
  const appContext = useAuth();
  const toast = useToast();

  const updateSelectedImgList = (img: SelectedImage) => {
    const updatedImgList = selectedImgs.filter(
      (item) => item.imageUri !== img.imageUri
    );

    selectImgs(updatedImgList);
  };

  const imgSelectHandler = (e: any) => {
    const fileObjList: File[] = Array.from(e.target?.files);
    const imgDiff = fileObjList.length + selectedImgs.length;

    if (imgDiff > imageLimit) {
      const errMssg =
        imageLimit > 1
          ? `You can only select up to ${imageLimit} images.  Please either remove an image or choose again.`
          : "You can only select one image.";

      toast({
        title: errMssg,
        status: "warning",
        isClosable: true,
        duration: 3000,
      });
      return;
    }

    const selectedImgList: SelectedImage[] = fileObjList.map((fileObj) => {
      const fileURL = URL.createObjectURL(fileObj);
      return {
        imageName: fileObj.name.split(".")[0],
        image: fileObj,
        imageUri: fileURL,
        userId: appContext?.authState.getUserData._id,
        imgType: "poll",
      };
    });

    selectImgs([...selectedImgs, ...selectedImgList]);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <ImagePicker handleImg={imgSelectHandler} imgsize={imgsize} />
        {selectedImgs.length > 0 && (
          <div
            className={`text-white ${styles.appColor} pl-2 pr-2 rounded ${styles.cursor}`}
            onClick={() => selectImgs([])}
          >
            Clear Image Selection
          </div>
        )}
        {selectedImgs.length > 0 && (
          <div
            style={{ fontSize: 14 }}
          >{`${selectedImgs.length}/${imageLimit}`}</div>
        )}
      </div>
      {selectedImgs.length > 0 && (
        <div className="form-group mt-2">
          <label
            htmlFor="question"
            className={`col-form-label ${styles.formTxt}`}
          >
            Selected Images
          </label>
          <div className="d-flex mt-2" id="selectedImgs">
            {selectedImgs.map((item, idx) => (
              <SelectedImgCtr
                img={item}
                updateImgs={updateSelectedImgList}
                key={idx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ImagePicker = ({ handleImg, imgsize }: any) => {
  const inputRef = useRef(null);

  return (
    <div className={styles.cursor} onClick={() => imgPickerHandler(inputRef)}>
      <ToolTipCtr
        mssg="Insert Image"
        position="right"
        style={{ bottom: "0", left: "92px" }}
      >
        <RiCamera2Line size={imgsize} color="#ff4d00" />
      </ToolTipCtr>
      <input
        type="file"
        id="imgPicker"
        style={{ display: "none" }}
        ref={inputRef}
        accept="image/*"
        onChange={handleImg}
        multiple
      />
    </div>
  );
};

export const SingleImagePicker = ({ handleImg, imgSize }: any) => {
  const inputRef = useRef(null);

  return (
    <div
      className={styles.cursor}
      data-toggle="tooltip"
      data-placement="top"
      title="Insert Image"
      onClick={() => imgPickerHandler(inputRef)}
    >
      <RiCamera2Line size={imgSize} color="#ff4d00" />
      <input
        type="file"
        id="imgPicker"
        style={{ display: "none" }}
        ref={inputRef}
        accept="image/*"
        onChange={handleImg}
      />
    </div>
  );
};

interface SelectedImgCtr {
  img: SelectedImage;
  updateImgs: (img: SelectedImage) => void;
}

export const SelectedImgCtr = ({ img, updateImgs }: SelectedImgCtr) => {
  return (
    <div className="position-relative mr-4">
      <img
        className={`img-thumbnail ${styles.imgCtr}`}
        src={img.imageUri}
        style={{ height: 90, width: 120 }}
      />
      <div
        className={`${styles.imgCancel} bg-secondary rounded ${styles.cursor}`}
        onClick={() => updateImgs(img)}
      >
        <IoIosClose size="22px" color="white" />
      </div>
    </div>
  );
};

export default ImgPicker;
