import SimpleBar from "simplebar-react";
import 'simplebar/dist/simplebar.min.css';


const Scrollbars = ({ style, children }: any) => (
  <>
    <SimpleBar style={{...style}} >{children}</SimpleBar>
  </>
);

export default Scrollbars;
