const getGeoLocation = async () => {
  try {
    const resp = await fetch("https://ipapi.co/json/");
    if (resp) {
      const data = await resp.json();
      return data;
    }
  } catch (err) {
    return err;
  }
};

export default getGeoLocation;
