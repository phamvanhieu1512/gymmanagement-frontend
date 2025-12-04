import axios from "axios";

export const getAllTransactions = async (access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-all-transactions`,
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

export const updateTransaction = async (id, data, access_token) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/update-transaction/${id}`,
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

export const getReportTransaction = async (data, access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-report-transaction`,
      {
        params: data,
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

export const exportExcel = async (data, access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-report-transaction/excel`,
      {
        params: data,
        headers: {
          token: `Bearer ${access_token}`,
        },
        responseType: "blob",
      }
    );
    return res;
  } catch (error) {
    console.log("Axios error:", error);
    throw error;
  }
};

export const exportPDF = async (data, access_token) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/admin/get-report-transaction/pdf`,
      {
        params: data,
        headers: {
          token: `Bearer ${access_token}`,
        },
        responseType: "blob",
      }
    );
    return res;
  } catch (error) {
    console.log("Axios error:", error);
    throw error;
  }
};
