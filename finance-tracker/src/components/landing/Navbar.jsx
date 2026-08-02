import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="relative z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <a href="#top">
          <Logo />
        </a>

        <ul className="hidden items-center gap-9 font-medium text-ink/80 lg:flex">
          <li><a href="#features" className="transition hover:text-forest-deep">Features</a></li>
          <li><a href="#demo" className="transition hover:text-forest-deep">Demo</a></li>
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-full border border-ink/15 bg-paper px-5 py-2.5 font-medium text-ink transition hover:border-ink/30 sm:inline-block"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-forest px-5 py-2.5 font-medium text-paper transition hover:bg-forest-deep"
          >
            Get Started Free
          </Link>
        </div>
      </nav>
    </header>
  );
}
