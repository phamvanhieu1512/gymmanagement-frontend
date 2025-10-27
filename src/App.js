import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/Admin/DefaultComponent/AdminDefaultComponent";
import StaffDefaultComponent from "./components/Staff/DefaultComponent/StaffDefaultComponent";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

function App() {
  // useEffect(() => {
  //   fetchApi();
  // }, []);

  console.log(
    "process.env.REACT_APP_API_URL_BACKEND",
    process.env.REACT_APP_API_URL_BACKEND
  );

  const fetchApi = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL_BACKEND}/user/get-all-users`
    );

    return res.data;
  };

  // Queries
  const query = useQuery({ queryKey: ["todos"], queryFn: fetchApi });

  console.log("query", query);
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
