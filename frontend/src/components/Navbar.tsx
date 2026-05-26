import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          RUMI
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">
            Dashboard
          </Link>
          <Link to="/habits" className="text-gray-600 hover:text-indigo-600 font-medium">
            Habits
          </Link>
          <Link to="/moods" className="text-gray-600 hover:text-indigo-600 font-medium">
            Moods
          </Link>
          <Link to="/journals" className="text-gray-600 hover:text-indigo-600 font-medium">
            Journals
          </Link>
        </div>
      </div>
      <button
        onClick={logout}
        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
