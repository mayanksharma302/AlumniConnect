import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();

    const storedUser = sessionStorage.getItem("user");
    const accessToken = sessionStorage.getItem("accessToken");

    // Not logged in
    if (!storedUser || !accessToken) {
        return (
            <Navigate to="/signin" replace state={{ from: location.pathname }} />
        );
    }

    let user;

    try {
        user = JSON.parse(storedUser);
    } catch (error) {
        console.error("Invalid user session:", error);

        sessionStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");

        return (<Navigate to="/signin" replace />);
    }

    // No role
    if (!user?.role) {
        console.error("User role is missing.");
        return (<Navigate to="/signin" replace />);
    }

    // Role doesn't have access to this portal
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        switch (user.role) {
            case "student":
                return (<Navigate to="/student/dashboard" replace />);

            case "alumni":
                return (<Navigate to="/alumni/dashboard" replace />);

            case "admin":
                return (<Navigate to="/admin/dashboard" replace />);

            default:
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("accessToken");

                return (<Navigate to="/signin" replace />);
        }
    }

    return children;
};

export default ProtectedRoute;