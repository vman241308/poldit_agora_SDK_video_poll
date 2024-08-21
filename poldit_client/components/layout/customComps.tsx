import { CSSProperties, HTMLAttributes, ReactNode, useState } from "react";
import styles from "../../appStyles/appStyles.module.css";
import btnStyles from "../../appStyles/btnStyles.module.css";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { IconType } from "react-icons/lib";

interface Props {
  mssg: string;
}

const {} = styles;
const {
  customBtn,
  customBtnOutline,
  customBtnOutlinePrimary,
  itemToolTip_Top,
  itemToolTip_Left,
  itemToolTip_Right,
  itemToolTip_Bottom,
  tooltiptext,
} = btnStyles;

export const MssgReadMoreLess = ({ mssg }: Props) => {
  const [readMore, toggleReadMore] = useState(false);

  const finalMssg =
    mssg.length >= 180 && !readMore ? `${mssg.slice(0, 200)} ...` : mssg;

  return (
    <div className="">
      {finalMssg}
      {mssg.length >= 180 && !readMore && (
        <div
          className={`${styles.cursor} pt-1`}
          onClick={() => toggleReadMore(true)}
        >
          <p className="card-text font-weight-normal text-primary">Read More</p>
        </div>
      )}
      {finalMssg && readMore && (
        <div
          className={`${styles.cursor} pt-1`}
          onClick={() => {
            toggleReadMore(false);
          }}
        >
          <p className="font-weight-normal text-primary">Read Less</p>
        </div>
      )}
    </div>
  );
};

interface MaxMinBtn {
  btnState: boolean;
  btnCat: string;
  toggleBtn: (val: string) => void;
}

export const MaxMinBtn = ({ btnState, btnCat, toggleBtn }: MaxMinBtn) => {
  let BtnIcon: IconType;

  if (!btnState) {
    BtnIcon = AiOutlineMinusSquare;
  } else BtnIcon = AiOutlinePlusSquare;

  return (
    <div className={`${btnStyles.maxMinBtn}`} onClick={() => toggleBtn(btnCat)}>
      <BtnIcon size={25} style={{ cursor: "pointer", color: "#a9a9a9" }} />
    </div>
  );
};

interface ToolTipCtr {
  children: ReactNode;
  mssg: string;
  position: string;
  style: CSSProperties | undefined;
}

export const ToolTipCtr = ({ mssg, position, style, children }: ToolTipCtr) => {
  let ctrPosStyle;

  if (position === "top") {
    ctrPosStyle = itemToolTip_Top;
  } else if (position === "left") {
    ctrPosStyle = itemToolTip_Left;
  } else if (position === "right") {
    ctrPosStyle = itemToolTip_Right;
  } else {
    ctrPosStyle = itemToolTip_Bottom;
  }

  return (
    <div className={`${ctrPosStyle}`}>
      <span className={`${tooltiptext}`} style={style}>
        <p className="text-white text-center">{mssg}</p>
      </span>
      {children}
    </div>
  );
};

interface CustomBtn {
  fontSize: number;
  children: ReactNode;
}

export const CustomBtn = ({ fontSize, children }: CustomBtn) => {
  return (
    <button
      className={`${customBtn} ${customBtnOutline} ${customBtnOutlinePrimary} my-2 my-sm-0`}
      style={{ fontSize }}
      type="button"
    >
      {children}
    </button>
  );
};
