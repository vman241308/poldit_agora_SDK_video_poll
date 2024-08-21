import { Stack, Button, SimpleGrid } from "@chakra-ui/react";
import { HomeBtn } from "pages";
import { Update } from "./views";

interface Sidebar {
  btns: HomeBtn[];
  update: Update;
  loading: boolean;
  // btnStates: BtnStates;
  isMobile?: boolean;
}
const Sidebar = ({ btns, update, loading, isMobile }: Sidebar) => {
  if (isMobile) {
    return (
      <SimpleGrid columns={2} spacing="2">
        <SideBarBtn
          btn={btns[0]}
          update={update}
          loading={loading && btns[0].active}
          isMobile={true}
        />
        {/* <SideBarBtn
          btn={btns[1]}
          update={update}
          loading={loading && btns[1].active}
          // loading={btnStates.trendingPollsLoading}
          isMobile={true}
        /> */}
        <SideBarBtn
          btn={btns[1]}
          update={update}
          loading={loading && btns[1].active}
          // loading={btnStates.newestPollsLoading}
          isMobile={true}
        />
      </SimpleGrid>
    );
  }

  return (
    <Stack spacing="3">
      <SideBarBtn
        btn={btns[0]}
        update={update}
        loading={loading && btns[0].active}
        // loading={btnStates.recentActivityLoading}
      />
      {/* <SideBarBtn
        btn={btns[1]}
        update={update}
        loading={loading && btns[1].active}
        // loading={btnStates.trendingPollsLoading}
      /> */}
      <SideBarBtn
        btn={btns[1]}
        update={update}
        loading={loading && btns[1].active}
        // loading={btnStates.newestPollsLoading}
      />
    </Stack>
  );
};

export default Sidebar;

interface SidebarBtn {
  update: Update;
  btn: HomeBtn;
  loading?: boolean;
  isMobile?: boolean;
}

const SideBarBtn = ({ btn, update, loading, isMobile }: SidebarBtn) => (
  <Button
    p="4"
    leftIcon={<btn.Icon />}
    rounded="md"
    _focus={{ outline: "none" }}
    _hover={{ outline: "none" }}
    bg={btn.active ? "poldit.100" : "white"}
    color={btn.active ? "white" : "gray.600"}
    fontSize={"sm"}
    boxShadow="md"
    borderColor="gray.400"
    isLoading={loading}
    loadingText="Loading"
    onClick={() => update(btn.btnName)}
  >
    {btn.btnName}
  </Button>
);
