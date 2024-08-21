import nodemailer from "nodemailer";
import { google } from "googleapis";
import configs from "../../endpoints.config";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import moment from "moment";
import { base_url, internal_url } from "../utils/urls";
import { sendErrorEmail } from "./autoEmails";

const {
  googleClientId,
  googleRefreshToken,
  googleRedirectUri,
  googleClientSecret,
  polditEmail,
} = configs;

const oAuth2Client = new google.auth.OAuth2(
  googleClientId,
  googleClientSecret,
  googleRedirectUri
);

oAuth2Client.setCredentials({ refresh_token: googleRefreshToken });

const sendEmailToUser = async (email: string, emailData: any) => {
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: polditEmail,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      refreshToken: googleRefreshToken,
      accessToken: accessToken as string,
    },
    tls: { rejectUnauthorized: false },
  });

  const dirPath = path.resolve("email_temps");

  let baseUrl = "";

  if (emailData.internal) {
    baseUrl = internal_url();
  } else baseUrl = base_url();

  // const baseUrl = base_url()

  const currentDayTime = moment().format("MMMM Do YYYY, h:mm a");

  const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: dirPath,
      defaultLayout: false,
    },
    viewPath: dirPath,
    extName: ".handlebars",
  };

  transporter.use("compile", hbs(handlebarOptions));

  const { subject, template, ...rest } = emailData;

  const mailOptions = {
    from: { name: "Poldit Alert", address: polditEmail },
    to: email,
    subject,
    template,
    context: { baseUrl, currentDayTime, ...rest },
  };

  setTimeout(async () => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        //   sendErrorEmail({
        //     message: (err as any).message,
        //     path: err,
        //     locations: [],
        //     extensions: [],
        //   });
      } else {
        console.log("Message sent: %s", { msgInfo: info, mailOptions });
      }
    });
    // try {
    //   const info = await transporter.sendMail(mailOptions);
    //   console.log("Message sent: %s", { msgInfo: info, mailOptions });
    // } catch (err) {
    //   sendErrorEmail({
    //     message: (err as any).message,
    //     path: err,
    //     locations: [],
    //     extensions: [],
    //   });
    //   console.log("Error occured");
    //   return;
    // }
  }, 1000 * 1);

  // let info = await transporter.sendMail(mailOptions);
  // if (info) {
  //   console.log("Message sent: %s", info.messageId);
  // } else {
  //   console.log("Error occured");
  // }
};

export default sendEmailToUser;
