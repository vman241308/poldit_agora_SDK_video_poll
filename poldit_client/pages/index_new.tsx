import { Box, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Layout from "_components/layout/Layout";
import NewUserModal from "_components/pageComponents/Home/NewUserModal";
import Metadata from "_components/pageComponents/Other/Metadata";
import GraphResolvers from "_apiGraphStrings/index";
import { useMutation } from "@apollo/client";
import { useAuth } from "_components/authProvider/authProvider";
import HomeBody from "_components/pageComponents/Home";

interface IProps {}

const Home = (props: IProps) => {
  ///////// Hooks //////////////////////////////////
  const auth = useAuth();

  /////// State Management//////////////////////////
  const [newUser, setNewUser] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  ////// GraphQl Queries and Mutations ///////////////
  const [removeNewUserFlag] = useMutation(
    GraphResolvers.mutations.REMOVE_NEW_USER_FLAG,
    { fetchPolicy: "network-only" }
  );

  ////// Functions /////////////////////////////////
  const closeNewUserModal = () => {
    setNewUser(false);
    removeNewUserFlag();
    onClose();
  };

  ///// Component Mounted/////////////////////////////
  useEffect(() => {
    const newUser = auth?.authState?.getUserData?.newUser;

    if (newUser) {
      setNewUser(true);
    }
  }, [auth]);

  return (
    <Layout>
      <Metadata title="Poldit Home" />
      <Box mt="5">
        <NewUserModal
          onOpen={onOpen}
          onClose={closeNewUserModal}
          isOpen={newUser}
          userId={auth?.authState?.getUserData?._id}
          // appId={auth?.authState?.getUserData?.appid}
        />
        <HomeBody />
      </Box>
    </Layout>
  );
};

export default Home;
