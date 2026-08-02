import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import Logo from "../components/landing/Logo";
import LeafSprig from "../components/landing/LeafSprig";
import { useAuth } from "../context/AuthContext";

const perks = ["Live market & currency data", "Smart budget tracking", "Free, no credit card"];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup({ name, email, password });
      navigate("/verify-otp", { state: { email }, replace: true });
    } catch (err) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream font-body text-ink">
      {/* Left: brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-forest px-12 py-10 lg:flex">
        <Link to="/">
          <span className="flex items-center gap-2 font-display text-2xl font-semibold text-paper">
            Finly<span className="text-amber">.</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight text-paper">
            Create your account in seconds.
          </h2>
          <ul className="mt-6 space-y-2.5">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2 text-sage/85">
                <Check size={16} className="text-amber" />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-sage/60">
          © {new Date().getFullYear()} Finly. All rights reserved.
        </p>

        <LeafSprig className="absolute -bottom-10 -right-10 h-64 w-64 opacity-20" />
      </div>

      {/* Right: form */}
      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <h1 className="font-display text-3xl font-semibold text-forest-deep">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            Already have one?{" "}
            <Link to="/login" className="font-medium text-moss hover:text-forest-deep">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="text-sm font-medium text-ink/75">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ayesha Khan"
                className="mt-1.5 w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-ink/75">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-ink/75">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 pr-11 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-coral-tint p-3.5 text-sm text-coral">
                <AlertTriangle size={16} className="mt-0.5 flex-none" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 font-medium text-paper shadow-lg shadow-forest/25 transition hover:bg-forest-deep disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create Account"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-ink/40">
            We'll email you a 6-digit code to confirm it's really you.
          </p>
        </div>
      </div>
    </div>
  );
}
