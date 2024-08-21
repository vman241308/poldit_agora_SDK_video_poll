import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getAuthId } from ".";
import CustomToast from "_components/pageComponents/Other/Toast";
import { BiErrorCircle } from "react-icons/bi";

const withAuth = ({ children, ...delegated }: any) => {
  const [hasMounted, setHasMounted] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const userId = getAuthId();

  useEffect(() => {
    setHasMounted(true);

    if (!userId) {
      router.replace("/Login");
      toast({
        id: "loginErr",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={
              "You are currently not logged in.  Please log in to see this page."
            }
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  }, []);

  if (!hasMounted || !userId) {
    return null;
  }

  return <div {...delegated}>{children}</div>;
};

export default withAuth;
