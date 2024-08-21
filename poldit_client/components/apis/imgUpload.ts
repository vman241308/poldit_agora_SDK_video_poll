import { SelectedImage } from "../appTypes/appType";

export const saveImgtoCloud = async (selectedImg: SelectedImage[]) => {
  // if (typeof selectedImg !== "object") {
  return Promise.all(
    (selectedImg as SelectedImage[]).map(async (item) => {
      return { entityKey: item.entityKey ?? "", img: await uploadImage(item) };
    })
  );
  // }

  // return await uploadImage(selectedImg as SelectedImage);
};

const uploadImage = async (imgDetails: SelectedImage) => {
  const { userId, image, imgType, imageName } = imgDetails;
  const NEXT_PUBLIC_CLOUDINARYAPIKEY = process.env.NEXT_PUBLIC_CLOUDINARYAPIKEY;
  const NEXT_PUBLIC_CLOUDINARYNAME = process.env.NEXT_PUBLIC_CLOUDINARYNAME;

  const folder = `PoldIt/Users/${userId}/${imgType}`;

  const signatureResponse = await fetch("/api/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, public_id: imageName }),
  });

  const { signature, timestamp } = await signatureResponse.json();

  if (NEXT_PUBLIC_CLOUDINARYAPIKEY && NEXT_PUBLIC_CLOUDINARYNAME) {
    const url = `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUDINARYNAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", image);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", imageName);
    formData.append("timestamp", timestamp);
    formData.append("api_key", NEXT_PUBLIC_CLOUDINARYAPIKEY);

    const apiResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await apiResponse.json();

    return data.secure_url;
  }
};

export default uploadImage;
