import {
  HStack,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  IconButton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { BsLink } from "react-icons/bs";
import {
  FacebookIcon,
  FacebookShareButton,
  RedditShareButton,
  RedditIcon,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import CustomToast from "../Toast";

const ShareBtns = ({ link }: { link: string }) => {
  const toast = useToast();
  const id = "copyToast";
  //Clipboard doesnt work unless your site is in https or localhost.  It returns an error on ip address
  const copyLink = () => {
    let href = "";

    if (process.env.NODE_ENV === "development") {
      href = `${process.env.NEXT_PUBLIC_DEV_URL}/Polls/${link}`;
    } else {
      href = `${process.env.NEXT_PUBLIC_PROD_URL}/Polls/${link}`;
    }

    navigator.clipboard.writeText(href);

    if (!toast.isActive(id)) {
      toast({
        id,
        duration: 2000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg="Link Copied"
            Icon={BsLink}
            bg="green.300"
            fontColor="white"
            iconSize="20px"
          />
        ),
      });
    }
  };

  return (
    <Portal>
      <PopoverContent _focus={{ outline: "none" }} w="100%" borderRadius="lg">
        <PopoverArrow />
        <PopoverBody>
          <HStack p="1">
            <Tooltip label="Share On Facebook" rounded={"md"}>
              <FacebookShareButton
                url={`https://poldit.com/Polls/${link}`}
                style={{ outline: "none" }}
                id={`facebook_share_${link}`}
              >
                <FacebookIcon round={true} size="24px" />
              </FacebookShareButton>
            </Tooltip>

            <Tooltip label="Share On Twitter" rounded={"md"}>
              <TwitterShareButton
                url={`https://poldit.com/Polls/${link}`}
                style={{ outline: "none" }}
                id={`twitter_share_${link}`}
              >
                <TwitterIcon round={true} size="24px" />
              </TwitterShareButton>
            </Tooltip>

            <Tooltip label="Share On Reddit" rounded={"md"}>
              <RedditShareButton
                url={`https://poldit.com/Polls/${link}`}
                style={{ outline: "none" }}
                id={`reddit_share_${link}`}
              >
                <RedditIcon round={true} size="24px" />
              </RedditShareButton>
            </Tooltip>

            <Tooltip label="Share On Linkedin" rounded={"md"}>
              <LinkedinShareButton
                url={`https://poldit.com/Polls/${link}`}
                style={{ outline: "none" }}
                id={`linkedin_share_${link}`}
              >
                <LinkedinIcon round={true} size="24px" />
              </LinkedinShareButton>
            </Tooltip>

            <Tooltip label="Copy Poll Link" rounded={"md"}>
              <IconButton
                aria-label="Call Sage"
                isRound={true}
                id={`copy_link_${link}`}
                size="xs"
                fontSize="18px"
                icon={<BsLink />}
                onClick={copyLink}
                _hover={{ border: "none", bgColor: "gray.600", color: "white" }}
                _focus={{
                  outline: "none",
                  bgColor: "gray.600",
                  color: "white",
                }}
              />
            </Tooltip>
          </HStack>
        </PopoverBody>
      </PopoverContent>
    </Portal>
  );
};

export default ShareBtns;
