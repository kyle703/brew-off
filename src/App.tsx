import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Shell from "./components/Shell";
import { SessionProvider } from "./context/Session";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import PrintGuestQr from "./pages/PrintGuestQr";
import PrintTags from "./pages/PrintTags";
import Register from "./pages/Register";
import Results from "./pages/Results";
import Reveal from "./pages/Reveal";
import Scorecard from "./pages/Scorecard";

export default function App() {
  const location = useLocation();
  const bare = location.pathname === "/reveal";

  return (
    <SessionProvider>
      {bare ? (
        <Routes>
          <Route path="/reveal" element={<Reveal />} />
        </Routes>
      ) : (
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/t/:code" element={<Scorecard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/tags" element={<PrintTags />} />
            <Route path="/admin/qr" element={<PrintGuestQr />} />
            <Route path="/reveal" element={<Reveal />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      )}
    </SessionProvider>
  );
}
