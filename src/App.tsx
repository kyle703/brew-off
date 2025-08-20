import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import Splash from "./pages/Splash";
import Reveal from "./pages/Reveal";
import Leaderboard from "./pages/Leaderboard";
import TestData from "./components/TestData";
import CommentTest from "./pages/CommentTest";

export default function App() {
  const location = useLocation();
  const isSplash = location.pathname === "/";
  return (
    <div>
      <nav className="sticky top-0 z-10 border-b border-navy-800 bg-navy-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Brand />
          <div className="flex gap-4 text-cream-100">
            <Link to="/">Home</Link>
            <Link to="/results">Results</Link>
            <Link to="/reveal">Reveal</Link>
            <Link to="/comments">Comments</Link>
            <Link to="/test">Test</Link>
          </div>
        </div>
      </nav>

      <div className={isSplash ? "px-0 py-0" : "mx-auto max-w-7xl px-4 py-6"}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/results" element={<Leaderboard />} />
          <Route path="/reveal" element={<Reveal />} />
          <Route path="/comments" element={<CommentTest />} />
          <Route path="/test" element={<TestData />} />
        </Routes>
      </div>
    </div>
  );
}

function Link({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? "text-amber-400" : "text-cream-100 hover:text-amber-400"
      }
    >
      {children}
    </NavLink>
  );
}
function Brand() {
  return <div className="font-semibold text-cream-100">🍺 Brew-Off</div>;
}
