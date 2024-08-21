import { Box, Input, useToast } from "@chakra-ui/react";
import { PoldItActionBtn } from "_components/pageComponents/Other/Button/brandedItems";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings/index";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";

export const VerifyEmailBtn = ({ token }: { token: string }) => {
  const router = useRouter();
  const toast = useToast();

  const [tokenExpired, setTokenExpired] = useState(false);

  const [verifyUserEmail, { data, loading, error }] = useMutation(
    GraphResolvers.mutations.VERIFY_USER_EMAIL
  );

  const [
    resendVerification,
    { data: verData, loading: verificationLoading, error: verError },
  ] = useMutation(GraphResolvers.mutations.REFRESH_USER_TOKEN);

  const verifyEmail = async () => {
    verifyUserEmail({
      variables: { token },
      onCompleted: (res) => {
        router.push("/Login");
        toast({
          title: res.verifyUserEmail,
          status: "success",
          isClosable: true,
          duration: 4000,
        });
      },

      onError: (err) => {
        const tokenExpired =
          err.message.search("jwt expired") > -1 ? true : false;

        tokenExpired && setTokenExpired(true);

        const errMessage = tokenExpired
          ? "Verification email link expired!  Please provide your email and click on the button to send a new verification email."
          : err.message;

        toast({
          title: errMessage,
          status: "error",
          isClosable: true,
          duration: 4000,
        });
      },
    });
  };

  const verificationHandler = () => {
    const email = (document.getElementById("tokenEmail") as HTMLInputElement)
      .value;

    resendVerification({
      variables: { email },
      onCompleted: (res) => {
        toast({
          title: res.refreshUserToken,
          status: "success",
          isClosable: true,
          duration: 4000,
        });
      },
      onError: (err) => {
        toast({
          title: err.message,
          status: "error",
          isClosable: true,
          duration: 4000,
        });
      },
    });
  };

  return (
    <>
      {tokenExpired ? (
        <>
          <Box>
            <Input
              placeholder="Email"
              id="tokenEmail"
              mb="5"
              required
              type="email"
            />
          </Box>

          <PoldItActionBtn
            btnLabel="Resend Verification Email"
            btnAction={verificationHandler}
          />
        </>
      ) : (
        <PoldItActionBtn btnLabel="Verify Email" btnAction={verifyEmail} />
      )}
    </>
  );
};

export const VerificationToken = ({ email }: { email: string }) => {
  const toast = useToast();

  const [
    resendVerification,
    { data: verData, loading: verificationLoading, error: verError },
  ] = useMutation(GraphResolvers.mutations.REFRESH_USER_TOKEN);

  const verificationHandler = () => {
    resendVerification({
      variables: { email },
      onCompleted: (res) => {
        toast({
          title: res.refreshUserToken,
          status: "success",
          isClosable: true,
          duration: 4000,
        });
      },
      onError: (err) => {
        toast({
          title: err.message,
          status: "error",
          isClosable: true,
          duration: 4000,
        });
      },
    });
  };

  return (
    <PoldItActionBtn
      btnLabel="Resend Verification Email"
      btnAction={verificationHandler}
      width="100%"
    />
  );
};
