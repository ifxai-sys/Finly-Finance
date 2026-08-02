import Logo from "./Logo";

export default function Footer() {
  return (
    <footer id="start" className="border-t border-ink/8 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink/55 sm:flex-row sm:px-10">
        <Logo />
        <p>© {new Date().getFullYear()} Finly. All figures shown are illustrative.</p>
      </div>
    </footer>
  );
}
