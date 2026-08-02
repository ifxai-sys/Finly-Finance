import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, MailCheck } from "lucide-react";
import Logo from "../components/landing/Logo";
import LeafSprig from "../components/landing/LeafSprig";
import { useAuth } from "../context/AuthContext";
import { resendOtpRequest } from "../api/auth";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyOtp() {
  const { verifySignupOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    timerRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [cooldown]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await verifySignupOtp({ email, code });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message ?? "That code didn't work. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError(null);
    setNotice(null);
    try {
      const res = await resendOtpRequest({ email });
      setNotice(res.message ?? "A new code has been sent.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.message ?? "Couldn't resend the code. Please try again.");
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
            One quick check before we let you in.
          </h2>
          <p className="mt-4 text-sage/80">
            We just want to make sure this email is really yours.
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
            <MailCheck size={22} />
          </div>

          <h1 className="mt-5 font-display text-3xl font-semibold text-forest-deep">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-ink/55">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-ink/75">{email}</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="code" className="text-sm font-medium text-ink/75">
                Verification code
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

            {notice && !error && (
              <div className="rounded-xl bg-moss/10 p-3.5 text-sm text-moss">{notice}</div>
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
              {isSubmitting ? "Verifying…" : "Verify & continue"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/55">
            Didn't get it?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className="font-medium text-moss hover:text-forest-deep disabled:cursor-not-allowed disabled:text-ink/30"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
