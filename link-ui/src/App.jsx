import { Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";

const App = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/" element={<LoginPage />} />
      <Route path="/main" element={<MainPage />} />
    </Routes>
  );
};

export default App;
