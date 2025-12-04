import axios from "axios";

export const getAllMembership = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-all-memberships`,
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

export const renewMembership = async (id, data, access_token) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/renew-membership/${id}`,
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
