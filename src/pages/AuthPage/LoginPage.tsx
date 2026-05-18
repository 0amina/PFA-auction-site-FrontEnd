// LoginPage.tsx
// useState  → form fields, show/hide password, loading
// useCallback → stable submit handler
// useAuth   → login() from AuthContext, redirects on success

import { useState, useCallback }  from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import BrandPanel from './BrandPanel';
import { useAuth } from '../../context/AuthContext';

const INPUT =
  'w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/40 font-body';

export default function LoginPage() {
  const { login }      = useAuth();
  const navigate       = useNavigate();
  const location       = useLocation();

  // Redirect back to the page the user was trying to visit, or home
  const from           = (location.state as { from?: Location })?.from?.pathname ?? '/';
  // Success message passed from SignUpPage after registration
  const successMessage = (location.state as { message?: string })?.message ?? '';

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [remember, setRemember]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);

  const isValid = email.trim() !== '' && password.length >= 6;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isValid, login, navigate, from]);

  return (
    <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl editorial-shadow bg-surface-container-lowest">
      <BrandPanel
        quote="Welcome back to the collection."
        sub="Sign in to continue bidding, managing your listings, and tracking your favourite lots."
      />

      {/* Form side */}
      <div className="p-8 md:p-14 flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight mb-2">
          Sign In
        </h1>
        <p className="text-on-surface-variant font-body mb-8">
          Welcome back. Enter your credentials to continue.
        </p>

        {successMessage && (
          <div className="mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-xl font-label text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl font-label text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline block">
              Email Address
            </label>
            <input
              className={INPUT}
              type="email"
              placeholder="curator@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline">
                Password
              </label>
              <a href="#" className="font-label text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                className={INPUT}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20"
            />
            <span className="font-body text-sm text-on-surface-variant">Keep me signed in</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-full transition-all active:scale-95 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none editorial-shadow flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Mobile signup link */}
          <p className="md:hidden text-center font-label text-sm text-outline pt-2">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-bold text-primary">Sign Up</Link>
          </p>
        </form>

        {/* Social login */}
        <div className="mt-6">
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute w-full border-t border-outline-variant/30" />
            <span className="relative bg-surface-container-lowest px-4 font-label text-xs text-outline uppercase tracking-widest">
              Or sign in with
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              {
                label: 'Google',
                icon: (
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0qIeV1C0XIfy1oIOxf7G6bSUf3N9LdFdRvlCQbVZsKkPJWUP3bYGrYv_UgdeDOq93HTWNZ_sm9rVaQ_tFM3o645cn3v0EQ849luOPZK_9iqdWvrRbRwi0kspftrni4VcdEv4cxYC0UNwIJYP5O4_ydX4cEObXKxss9wu6bb8ayE1kAP_KPxuRCiOJxf0vxpMcDC2fspPS2TlFoazC6IWpxrBZSpDAEtNWb-PoXD9EQ1gqhkauTk-r6XJR1hXB_L4IjDZqGC0ywA"
                    alt="Google"
                    className="w-5 h-5"
                  />
                ),
              },
              { label: 'Apple', icon: <span className="material-symbols-outlined text-xl">ios</span> },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 py-3 bg-surface border border-outline-variant/20 rounded-xl hover:bg-surface-container-low transition-colors font-headline font-semibold text-sm text-on-surface"
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}