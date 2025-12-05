import CheckInLogsPage from "../pages/staff/CheckInLogsPage/CheckInLogsPage";
import DashboardPage from "../pages/admin/DashboardPage/DashboardPage";
import MembersPage from "../pages/staff/MembersPage/MembersPage";
import SchedulePage from "../pages/staff/SchedulePage/SchedulePage";
import TrainersPage from "../pages/admin/TrainersPage/TrainersPage";
import TransactionsPage from "../pages/admin/TransactionsPage/TransactionsPage";
import LoginPage from "../pages/Login_SignUp/LoginPage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage/StaffDashboardPage";
import UpdatePackagePage from "../pages/staff/UpdatePackagePage/UpdatePackagePage";
import StaffsPage from "../pages/admin/StaffsPage/StaffsPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import ForgotPasswordPage from "../pages/Login_SignUp/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Login_SignUp/ResetPasswordPage";
import MembershipPage from "../pages/admin/MembershipPage/MembershipPage";
import PackagePage from "../pages/admin/PackagePage/PackagePage";
import UserPage from "../pages/admin/UserPage/UserPage";
import AttendancePage from "../pages/admin/AttendancePage/AttendancePage";
import MessagePage from "../pages/admin/MessagePage/MessagePage";
import NotificationPage from "../pages/admin/NotificationPage/NotificationPage";
import BoxesMessage from "../pages/admin/MessagePage/BoxesMessages";

export const routes = [
  {
    path: "/",
    page: LoginPage,
    isShowMenuBarAdmin: false,
    isGuest: true,
  },

  {
    path: "/ForgotPassword",
    page: ForgotPasswordPage,
    isShowMenuBarAdmin: false,
  },

  {
    path: "/ResetPassword/:token",
    page: ResetPasswordPage,
    isShowMenuBarAdmin: false,
  },

  // ADMIN ROUTES
  {
    path: "/admin",
    page: DashboardPage, // Trang tổng quan
    isShowMenuBarAdmin: true,
    isPrivate: true,
    allowedRoles: ["admin"],
  },
  {
    path: "/admin/packages",
    page: PackagePage, // Quản lý gói tập
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/memberships",
    page: MembershipPage, // Quản lý hội viên
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/users",
    page: UserPage, // Quản lý người dùng
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/trainers",
    page: TrainersPage, // Quản lý huấn luyện viên
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/attendance",
    page: AttendancePage, // Quản lý điểm danh
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/transactions",
    page: TransactionsPage, // Theo dõi giao dịch
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/staffs",
    page: StaffsPage, // Quản lý nhân viên
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/notifications",
    page: NotificationPage, // Quản lý thông báo
    isShowMenuBarAdmin: true,
  },
 
  {
    path: "/admin/messages",
    page: MessagePage, // Nhắn tin
    isShowMenuBarAdmin: true,
  },
  {
    path: "/admin/boxes",
    page: BoxesMessage, // Nhắn tin
    isShowMenuBarAdmin: true,
  },

  // STAFF ROUTES
  {
    path: "/staff",
    page: StaffDashboardPage, // Trang tổng quan nhân viên (có thể là danh sách hội viên)
    isShowMenuBarStaff: true,
    isPrivate: true,
    allowedRoles: ["staff"],
  },
  {
    path: "/staff/members",
    page: MembersPage, // Xem hội viên
    isShowMenuBarStaff: true,
  },
  {
    path: "/staff/packages",
    page: UpdatePackagePage, // Cập nhật gói tập / xác nhận thanh toán
    isShowMenuBarStaff: true,
  },
  {
    path: "/staff/checkins",
    page: CheckInLogsPage, // Quản lý check-in
    isShowMenuBarStaff: true,
  },
  {
    path: "/staff/schedules",
    page: SchedulePage, // Cập nhật lịch tập
    isShowMenuBarStaff: true,
  },
  {
    path: "*",
    page: NotFoundPage, // Đăng xuất
  },
];
