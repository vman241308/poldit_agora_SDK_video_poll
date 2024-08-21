import { GraphQLError } from "graphql";
import moment from "moment";
import { UserNotification } from "../../interfaces";
import IContactUs from "../../models/interfaces/contactUs";
import poldItMailer from "./nodeMailer";
import configs from "../../endpoints.config";

export const sendInternalResetPasswordMail = async (
  email: string,
  token: string
) => {
  await poldItMailer(email, {
    urlRoute: "ResetPassword",
    internal: true,
    token,
    subject: "Reset Password",
    template: "resetInternalPwd",
  });
};

export const sendResetPasswordMail = async (email: string, token: string) => {
  await poldItMailer(email, {
    urlRoute: "ForgotPassword",
    token,
    subject: "Forgot Password",
    template: "forgotPwd",
  });
};

interface EmailUserNotification extends UserNotification {
  subject: string;
  content: string;
}

export const sendErrorEmail = (err: GraphQLError | any) => {
  if (!configs.isDev) {
    configs.adminEmails.forEach(async (email) => {
      await poldItMailer(email, {
        template: "errorMssg",
        subject: `Prod Poldit Error: ${err.message}`,
        notification: `Error occured in ${JSON.stringify(err.path)}.  
        
        Other Usefull error data: 
        ${JSON.stringify(err.locations)} 
        
        ${JSON.stringify(err.extensions)}`,
      });
    });
  }
};

export const sendEmailNotification = async (
  notification: EmailUserNotification,
  email: string
) => {
  const id = notification.parentCollectionId
    ? notification.parentCollectionId.toString()
    : notification.collectionId;

  try {
    await poldItMailer(email, {
      id,
      notification: notification.message,
      poll: notification.content,
      notificationType: notification.collectionType,
      subject: notification.subject ?? "Poldit Notification",
      template: "notification",
    });
  } catch (err) {
    return;
  }
};

export const sendTokenEmail = async (token: string, email: string) => {
  const currenMomentObje = moment();
  const currentDayTime = currenMomentObje.add(1, "hours").toLocaleString();

  await poldItMailer(email, {
    currentDayTime,
    token,
    subject: "Email verification for Poldit",
    template: "verification",
  });
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  appId: string
) => {
  await poldItMailer(email, {
    firstName,
    appId,
    subject: "Welcome to Poldit!",
    template: "welcome",
  });
};

export const sendChangePWEmail = async (
  email: string,
  firstName: string,
  appId: string
) => {
  await poldItMailer(email, {
    firstName,
    appId,
    subject: "Your password has been changed",
    template: "pwchange",
  });
};

export const sendContactUsEmail = async (msgObj: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  mssg: string;
}) => {
  await poldItMailer("support@poldit.com", {
    ...msgObj,
    subject: `Feedback from ${msgObj.email}`,
    template: "contactUs",
  });
};
