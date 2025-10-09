import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import DefaultComponent from "./components/Admin/DefaultComponent/AdminDefaultComponent";
import StaffDefaultComponent from "./components/Staff/DefaultComponent/StaffDefaultComponent";

function App() {
  return (
    <Router>
      <Routes>
        {routes.map((route) => {
          const Page = route.page;

          // 🧩 Xác định layout hiển thị
          let Layout = Fragment; // Mặc định: không layout (dành cho login, not found,...)

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
