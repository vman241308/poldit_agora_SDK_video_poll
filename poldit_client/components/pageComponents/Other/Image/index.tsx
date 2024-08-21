import { useState } from "react";
// import "jquery";
import { IoIosClose } from "react-icons/io";
import styles from "../../../../appStyles/appStyles.module.css";


const { cursor, imgCancel } = styles;

const ImageDisplay = ({ imgList }: { imgList: string[] }) => {
  const [pollImg, togglePollImg] = useState("");

  return (
    <ul className="list-group list-group-horizontal w-50 justify-content-between">
      {imgList.map((item, idx) => (
        <li
          key={String(idx)}
          className={`list-group-item border border-none ${cursor}`}
          typeof="button"
          data-toggle="modal"
          data-target="#imgViewerModal"
          onClick={() => togglePollImg(item)}
        >
          <img src={item} style={{ height: "5vh", width: "8vh" }} />
        </li>
      ))}
      <ImgViewModal img={pollImg} />
    </ul>
  );
};

export default ImageDisplay;

const ImgViewModal = ({ img }: { img: string }) => {
  return (
    <div
      className="modal fade rounded"
      id="imgViewerModal"
      tabIndex={-1}
      aria-labelledby="imgViewerModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content d-flex position-relative">
          <img src={img} style={{ height: "auto", width: "auto" }} />
          <div
            className={`${imgCancel} bg-secondary ${cursor}`}
            onClick={() => ($("#imgViewerModal") as any).modal("hide")}
          >
            <IoIosClose size="22px" color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};
