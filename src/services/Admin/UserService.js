import axios from "axios";

export const axiosJWT = axios.create();

export const loginUser = async (data) => {
  try {
    const resLogin = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/sign-in`,
      data,
      {
        withCredentials: true,
      }
    );

    return resLogin.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const resRefreshToken = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    );
    return resRefreshToken.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getDetailsUser = async (id, access_token) => {
  try {
    const resGetDetails = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-details-user/${id}`,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return resGetDetails.data;
  } catch (error) {
    console.log(error);
    // throw error;
  }
};

export const logoutUser = async () => {
  try {
    const resLogout = await axiosJWT.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/log-out`,
      {},
      { withCredentials: true }
    );
    return resLogout.data;
  } catch (error) {
    console.log(error);
    // throw error;
  }
};

export const createUser = async (data, access_token) => {
  try {
    const resSignIn = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/create-member`,
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

export const getAllMembers = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-members`,
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

export const getAllMembersAndStaffs = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-members-staffs`,
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

export const getAllMembersAndStaffsAdmin = async (access_token, userId) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-members-staffs-admin/${userId}`,
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

export const updateMember = async (id, data, access_token) => {
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

export const getDetailsMember = async (id, access_token) => {
  try {
    const resGetDetails = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-details-member/${id}`,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return resGetDetails.data;
  } catch (error) {
    console.log(error);
    // throw error;
  }
};

export const getDetailsTrainer = async (id, access_token) => {
  try {
    const resGetDetails = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-details-trainer/${id}`,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return resGetDetails.data;
  } catch (error) {
    console.log(error);
    // throw error;
  }
};

export const resetPasswordUser = async (data, access_token) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/reset-password`,
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
