import axios from "axios";

export const createUser = async (data, access_token) => {
  try {
    const resSignIn = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/create-trainer`,
      data,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );

    return resSignIn.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllStaffs = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-staffs`,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Axios error:", error);
    throw error;
  }
};

export const updateTrainer = async (id, data, access_token) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/update-user/${id}`,
      data,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Axios error:", error);
    throw error;
  }
};

export const uploadAvatar = async (id, data, access_token) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/upload-avatar/${id}`,
      data,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Axios error:", error);
    throw error;
  }
};
