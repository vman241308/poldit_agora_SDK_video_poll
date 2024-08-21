import {
  Button,
  ButtonGroup,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Popup {
  isOpen: boolean;
  toggle: (btnState: boolean) => void;
  clear: () => void;
}

export const CancelPopup = ({ isOpen, toggle, clear }: Popup) => {
  return (
    <>
      <Popover
        isOpen={isOpen}
        onClose={() => toggle(false)}
        placement="bottom"
        strategy="fixed"
      >
        <PopoverTrigger>
          <Button borderWidth="1px" size="sm" onClick={() => toggle(!isOpen)}>
            Cancel
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader fontWeight="semibold">Confirmation</PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody fontSize={"sm"}>
            Are you sure you want to return to the previous page? If you started
            creating a new poll, all of your content will be lost!
          </PopoverBody>
          <PopoverFooter d="flex" justifyContent="flex-end">
            <ButtonGroup size="sm">
              <Button variant="outline" onClick={() => toggle(!isOpen)}>
                Cancel
              </Button>
              <Link href="/">
                <Button
                  colorScheme="red"
                  onClick={() => {
                    clear();
                    toggle(false);
                  }}
                >
                  Continue
                </Button>
              </Link>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </>
  );
};

export const ClearAllPopUp = ({ isOpen, toggle, clear }: Popup) => {
  return (
    <>
      <Popover
        isOpen={isOpen}
        onClose={() => toggle(false)}
        placement="bottom"
        strategy="fixed"
      >
        <PopoverTrigger>
          <Button borderWidth="1px" size="sm" onClick={() => toggle(!isOpen)}>
            Clear All
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader fontWeight="semibold">Confirmation</PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            Are you sure you want to clear the content on this page?
          </PopoverBody>
          <PopoverFooter d="flex" justifyContent="flex-end">
            <ButtonGroup size="sm">
              <Button variant="outline" onClick={() => toggle(!isOpen)}>
                Cancel
              </Button>

              <Button
                colorScheme="red"
                onClick={() => {
                  clear();
                  toggle(false);
                }}
              >
                Continue
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </>
  );
};
