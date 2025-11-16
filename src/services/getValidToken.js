import * as UserService from "./Admin/UserService";
import { jwtDecode } from "jwt-decode";
import { isJsonString } from "../utils/utils";

export const getValidToken = async () => {
  let storageData = localStorage.getItem("accessToken");
  if (!storageData) return null;

  if (isJsonString(storageData)) {
    storageData = JSON.parse(storageData);
    const decoded = jwtDecode(storageData);

    const currentTime = new Date().getTime() / 1000;
    if (decoded.exp < currentTime) {
      // token hết hạn -> refresh
      const data = await UserService.refreshToken();
      localStorage.setItem("accessToken", JSON.stringify(data.access_Token));
      return data.access_Token;
    }
    return storageData;
  }

  return null;
};
