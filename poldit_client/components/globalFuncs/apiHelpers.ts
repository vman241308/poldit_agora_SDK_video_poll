import { saveImgtoCloud } from "_components/apis/imgUpload";

export interface SecureImg {
  entityKey?: string;
  img: string;
}

export const getSecureImgLinks = async (
  fileList: any[],
  userId: string,
  imgType: string
) => {
  const fileObjs = fileList.map((file) => {
    return {
      imageName: file.name.split(".")[0],
      image: file,
      imageUri: file.preview,
      userId,
      imgType,
      entityKey: file.entityKey,
    };
  });

  try {
    const resp: SecureImg[] = await saveImgtoCloud(fileObjs);
    if (resp) {
      fileList.forEach((file) => {
        URL.revokeObjectURL(file.preview);
      });
    }
    return resp;
  } catch (err) {
    return null;
  }
};
