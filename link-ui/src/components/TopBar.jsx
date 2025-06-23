// src/components/TopBar.jsx
import { LogOut } from "lucide-react";

function TopBar() {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="bg-black text-white flex items-center justify-between px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold text-yellow-400 tracking-wide">
        Link App
      </h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </header>
  );
}

export default TopBar;
