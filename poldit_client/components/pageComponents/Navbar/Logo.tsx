import React from "react";
import { Box, Text, Image, Flex } from "@chakra-ui/react";
import router from "next/router";
import Link from "next/link";

export default function Logo(props: any) {
  return (
    <Box {...props}>
      <Link href={"/"}>
        <Image
          src="https://res.cloudinary.com/poldit/image/upload/v1649783920/PoldIt/App_Imgs/official_full_logo_poldit_mch8f6.jpg"
          minW="130px"
          w="130px"
          cursor="pointer"
        />
      </Link>
    </Box>
  );
}
