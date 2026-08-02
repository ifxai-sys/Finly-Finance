import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Logo from "../components/landing/Logo";
import LeafSprig from "../components/landing/LeafSprig";
import { resetPasswordRequest } from "../api/auth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordRequest({ email, code, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError(err.message ?? "That code didn't work. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-cream font-body text-ink">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-forest px-12 py-10 lg:flex">
        <Link to="/">
          <span className="flex items-center gap-2 font-display text-2xl font-semibold text-paper">
            Finly<span className="text-amber">.</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight text-paper">
            Almost back in.
          </h2>
          <p className="mt-4 text-sage/80">
            Enter the code we emailed you along with a new password.
          </p>
        </div>

        <p className="relative z-10 text-sm text-sage/60">
          © {new Date().getFullYear()} Finly. All rights reserved.
        </p>

        <LeafSprig className="absolute -bottom-10 -right-10 h-64 w-64 opacity-20" />
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-moss/15 text-moss">
            <ShieldCheck size={22} />
          </div>

          <h1 className="mt-5 font-display text-3xl font-semibold text-forest-deep">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            Code sent to <span className="font-medium text-ink/75">{email}</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="code" className="text-sm font-medium text-ink/75">
                Reset code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="mt-1.5 w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-center text-lg tracking-[0.4em] text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="text-sm font-medium text-ink/75">
                New password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-ink/75">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1.5 w-full rounded-xl border border-ink/12 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
              />
            </div>

            {done && (
              <div className="rounded-xl bg-moss/10 p-3.5 text-sm text-moss">
                Password reset — taking you to log in…
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-coral-tint p-3.5 text-sm text-coral">
                <AlertTriangle size={16} className="mt-0.5 flex-none" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3.5 font-medium text-paper shadow-lg shadow-forest/25 transition hover:bg-forest-deep disabled:opacity-60"
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink/55">
            <Link to="/forgot-password" className="font-medium text-moss hover:text-forest-deep">
              Didn't get a code? Try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
