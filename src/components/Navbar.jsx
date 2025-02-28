import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Now using navigate inside Navbar
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

const Navbar = () => {
  const [user] = useAuthState(auth);
  const [profilePic, setProfilePic] = useState("");
  const navigate = useNavigate(); // ✅ Now works because Navbar is inside <Router>

  useEffect(() => {
    setProfilePic(user?.photoURL || "https://via.placeholder.com/150");
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login"); // ✅ Redirects properly
  };

  return (
    <div className="navbar bg-gray-900 text-white px-8 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold"></h1>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <p>Welcome, {user.displayName || "User"}!</p>
            
            <button onClick={handleLogout} className="btn btn-error">Logout</button> {/* ✅ Works properly now */}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
