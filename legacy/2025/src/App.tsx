import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import Reveal from "./pages/Reveal";
import Leaderboard from "./pages/Leaderboard";
import { DataProvider } from "./context/DataProvider";

export default function App() {
  const location = useLocation();
  const isReveal = location.pathname === "/reveal";

  return (
    <DataProvider>
      <div>
        <nav className="sticky top-0 z-50 border-b border-navy-800 bg-navy-900/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <NavLink to="/" end className="whitespace-nowrap font-semibold text-cream-100 hover:text-amber-400">
              <span className="sm:hidden">🍺 2025</span>
              <span className="hidden sm:inline">🍺 Golden Spoon 2025</span>
            </NavLink>
            <div className="flex items-center gap-3 sm:gap-5">
              <Link to="/" end>
                Leaderboard
              </Link>
              <Link to="/reveal">Reveal</Link>
            </div>
          </div>
        </nav>

        <div className={isReveal ? "" : "mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6"}>
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/results" element={<Navigate to="/" replace />} />
            <Route path="/reveal" element={<Reveal />} />
          </Routes>
        </div>
      </div>
    </DataProvider>
  );
}

function Link({
  to,
  children,
  end,
}: {
  to: string;
  children: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive
          ? "text-xs font-semibold uppercase tracking-wide text-amber-400 sm:text-sm sm:tracking-widest"
          : "text-xs font-semibold uppercase tracking-wide text-cream-100 hover:text-amber-400 sm:text-sm sm:tracking-widest"
      }
    >
      {children}
    </NavLink>
  );
}
