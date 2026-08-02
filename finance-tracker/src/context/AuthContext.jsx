import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchCurrentUser,
  loginRequest,
  signupRequest,
  updateProfileRequest,
  verifySignupOtpRequest,
} from "../api/auth";
import { setToken, UnauthorizedError } from "../api/client";

const AuthContext = createContext(null);
const SESSION_KEY = "finance-tracker:session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if we have a cached user, show it immediately (no flash
  // of the login page) then quietly verify the JWT against /api/auth/me —
  // if it's expired or invalid, log out.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }

      try {
        const freshUser = await fetchCurrentUser();
        if (!cancelled) persistSession(freshUser);
      } catch (err) {
        if (!cancelled && err instanceof UnauthorizedError) {
          persistSession(null);
        }
        // Network errors (backend not running yet) are ignored here so the
        // cached user can still be shown; subsequent API calls will surface it.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistSession(nextUser) {
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
      setToken(null);
    }
  }

  async function login(credentials) {
    const { access_token, user: loggedInUser } = await loginRequest(credentials);
    setToken(access_token);
    persistSession(loggedInUser);
    return loggedInUser;
  }

  async function signup(details) {
    // Just triggers the OTP email — no session yet. See verifySignupOtp().
    return signupRequest(details);
  }

  async function verifySignupOtp({ email, code }) {
    const { access_token, user: newUser } = await verifySignupOtpRequest({ email, code });
    setToken(access_token);
    persistSession(newUser);
    return newUser;
  }

  function logout() {
    persistSession(null);
  }

  async function updateProfile(changes) {
    const updatedUser = await updateProfileRequest(changes);
    persistSession(updatedUser);
    return updatedUser;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        verifySignupOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
  return ctx;
}
