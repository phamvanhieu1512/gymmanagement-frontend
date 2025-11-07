import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/Admin/DefaultComponent/AdminDefaultComponent";
import StaffDefaultComponent from "./components/Staff/DefaultComponent/StaffDefaultComponent";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import * as UserService from "./services/Admin/UserService";
import { updateUser } from "./redux/slides/userSlice";
import { isJsonString } from "./utils/utils";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const { storageData, decoded } = handleDecoded();
    if (decoded?.id) {
      handleGetDetailsUser(decoded?.id, storageData);
    }
  }, []);

  const handleDecoded = () => {
    let storageData = localStorage.getItem("accessToken");
    let decoded = {};
    if (storageData && isJsonString(storageData)) {
      storageData = JSON.parse(storageData);
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };

  UserService.axiosJWT.interceptors.request.use(
    async function (config) {
      const currentTime = new Date();
      const { storageData, decoded } = handleDecoded();

      if (decoded?.exp < currentTime.getTime() / 1000) {
        const data = await UserService.refreshToken();
        config.headers["token"] = `Bearer ${data?.access_Token}`;
      }
      // Do something before request is sent
      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );

  const handleGetDetailsUser = async (id, token) => {
    const resGetDetails = await UserService.getDetailsUser(id, token);
    dispatch(updateUser({ ...resGetDetails?.data, access_Token: token }));
  };

  return (
    <Router>
      <Routes>
        {routes.map((route) => {
          const Page = route.page;

          let Layout = Fragment;
          if (route.isShowMenuBarAdmin) {
            Layout = DefaultComponent;
          } else if (route.isShowMenuBarStaff) {
            Layout = StaffDefaultComponent;
          }

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Layout>
                  <Page />
                </Layout>
              }
            />
          );
        })}
      </Routes>
    </Router>
  );
}

export default App;
