import CheckInLogsPage from "../pages/staff/CheckInLogsPage/CheckInLogsPage";
import DashboardPage from "../pages/admin/DashboardPage/DashboardPage";
import MembershipPackage from "../pages/admin/MembershipPackage/MembershipPackage";
import MembersPage from "../pages/staff/MembersPage/MembersPage";
import SchedulePage from "../pages/staff/SchedulePage/SchedulePage";
import TrainersPage from "../pages/admin/TrainersPage/TrainersPage";
import TransactionsPage from "../pages/admin/TransactionsPage/TransactionsPage";
import LoginPage from "../pages/Login_SignUp/LoginPage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage/StaffDashboardPage";
import UpdatePackagePage from "../pages/staff/UpdatePackagePage/UpdatePackagePage";
import LogoutPage from "../pages/Login_SignUp/LogoutPage";
import ReportsPage from "../pages/admin/ReportsPage/ReportsPage";
import StaffsPage from "../pages/admin/StaffsPage/StaffsPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

export const routes = [
  {
    path: "/login",
    page: LoginPage,
    isShowMenuBar: false,
  },
  // ADMIN ROUTES
  {
    path: "/admin",
    page: DashboardPage, // Trang tổng quan
    isShowMenuBar: true,
  },
  {
    path: "/admin/packages",
    page: MembershipPackage, // Quản lý gói tập
    isShowMenuBar: true,
  },
  {
    path: "/admin/trainers",
    page: TrainersPage, // Quản lý huấn luyện viên
    isShowMenuBar: true,
  },
  {
    path: "/admin/transactions",
    page: TransactionsPage, // Theo dõi giao dịch
    isShowMenuBar: true,
  },
  {
    path: "/admin/reports",
    page: ReportsPage, // Báo cáo tổng hợp
    isShowMenuBar: true,
  },
  {
    path: "/admin/staffs",
    page: StaffsPage, // Quản lý nhân viên
    isShowMenuBar: true,
  },
  {
    path: "/admin/logout",
    page: LogoutPage, // Đăng xuất
    isShowMenuBar: true,
  },

  // STAFF ROUTES
  {
    path: "/staff",
    page: StaffDashboardPage, // Trang tổng quan nhân viên (có thể là danh sách hội viên)
  },
  {
    path: "/staff/members",
    page: MembersPage, // Xem hội viên
  },
  {
    path: "/staff/packages",
    page: UpdatePackagePage, // Cập nhật gói tập / xác nhận thanh toán
  },
  {
    path: "/staff/checkins",
    page: CheckInLogsPage, // Quản lý check-in
  },
  {
    path: "/staff/schedules",
    page: SchedulePage, // Cập nhật lịch tập
  },
  {
    path: "/staff/logout",
    page: LogoutPage, // Đăng xuất
  },
  {
    path: "*",
    page: NotFoundPage, // Đăng xuất
  },
];
