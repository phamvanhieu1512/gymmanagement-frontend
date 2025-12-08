import axios from "axios";

export const createQR = async (token, body) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/checkin/qr/create`,
      body,
      {
        headers: { token: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Axios error:", error);
    throw error;
  }
};

export const getAllMembers = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/checkin/members`,
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

export const getAllCheckInHistory = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/checkin/history-all`,
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
