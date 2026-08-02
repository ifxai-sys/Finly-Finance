import { useState } from "react";
import { Check } from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account details.">
      <div className="max-w-lg rounded-2xl bg-paper p-6 shadow-sm">
        <h3 className="font-semibold text-ink">Profile</h3>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/55">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/12 bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-moss"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/55">Email</label>
            <input
              value={user?.email ?? ""}
              disabled
              className="mt-1 w-full cursor-not-allowed rounded-xl border border-ink/12 bg-cream-deep px-3.5 py-2.5 text-sm text-ink/50"
            />
            <p className="mt-1 text-xs text-ink/40">Email can't be changed yet.</p>
          </div>

          {error && <p className="text-sm text-coral">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:opacity-60"
          >
            {saved && <Check size={15} />}
            {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="max-w-lg rounded-2xl bg-paper p-6 shadow-sm">
        <h3 className="font-semibold text-ink">Password &amp; Security</h3>
        <p className="mt-2 text-sm text-ink/55">
          Password reset and sign-up email verification (OTP) are coming soon.
        </p>
      </div>
    </DashboardLayout>
  );
}
