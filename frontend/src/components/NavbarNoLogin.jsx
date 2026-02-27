import { useNavigate } from "react-router-dom";
import ceiLogo from "../assets/cei.png";

export default function NavBarNoLogin() {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b-2 border-orange-500 px-6 py-3 flex justify-between items-center">
      
      <div className="flex items-center gap-3">
        <img
          src={ceiLogo}
          alt="CEi Logo"
          className="w-12 h-12 object-contain"
        />
        <h1 className="text-2xl font-semibold text-black">
          CEiVoice
        </h1>
      </div>

      <button
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl"
        onClick={() => navigate("/login")}
      >
        Log in
      </button>
    </div>
  );
}