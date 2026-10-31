import { useEffect, type ReactNode } from "react";
import "./journal.css";

export default function JournalFrame({
  id,
  title,
  className,
  children,
}: {
  id: string;
  title: string;
  className: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.journal = id;
    document.title = title;
    return () => {
      if (root.dataset.journal === id) delete root.dataset.journal;
    };
  }, [id, title]);

  return <div className={className}>{children}</div>;
}
