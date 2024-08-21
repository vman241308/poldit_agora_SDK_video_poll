import { Box } from "@chakra-ui/react";
//@ts-ignore
import ReactImageModal from "react-image-modal";

const ImageModal: React.FC<{ src: string }> = ({ src }) => {
  return (
    <Box>
      <ReactImageModal src={src} alt="Vercel Logo" />
    </Box>
  );
};
export default ImageModal;
