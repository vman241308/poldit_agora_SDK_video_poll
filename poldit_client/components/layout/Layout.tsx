import { Box } from "@chakra-ui/layout";
import NavBar from "_components/pageComponents/Navbar";

interface LayoutProps {
  children: any;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <NavBar />
      <Box
        minH="100vh"
        pt="60px"
        // bg="#fae6dd"
        bg="gray.200"
        // bg={
        //   "#f3f3f3 url(https://res.cloudinary.com/poldit/image/upload/v1654177459/PoldIt/App_Imgs/istockphoto-1188579880-612x612_wvdgwr.jpg) no-repeat"
        // }
        // bgGradient='linear(to-r, red.100, gray.200)'
      >
        <main>{children}</main>
      </Box>
    </>
  );
};

export default Layout;
