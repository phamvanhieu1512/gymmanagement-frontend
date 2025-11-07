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
