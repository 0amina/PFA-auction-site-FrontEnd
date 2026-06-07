import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAuthFetch } from "../../hooks/useAuthFetch";
import { formatMoney } from "../../utils/currency";

/**
 * TND top-up via the payment-service / Konnect gateway.
 *   1. POST /payments/deposit/initiate { amount } → { paymentUrl, paymentRef }
 *   2. mock mode  → hit the mock-pay link (credits the balance), then refresh
 *      live mode  → redirect the browser to the Konnect checkout (paymentUrl)
 */
export default function AddBalancePage() {
  const { user, refreshUser } = useAuth();
  const authFetch = useAuthFetch();

  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // null = still checking; deposits require at least one saved card.
  const [hasCard, setHasCard] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await authFetch("/payments/cards");
        if (!res.ok) return;
        const cards = await res.json();
        if (alive) setHasCard(Array.isArray(cards) && cards.length > 0);
      } catch {
        /* leave hasCard null — submit still guarded server-side */
      }
    })();
    return () => { alive = false; };
  }, [authFetch]);

  const quickSet = (val: number) => setAmount(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/payments/deposit/initiate", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Could not start the deposit.");
      }
      const { paymentUrl, paymentRef } = await res.json();

      if (typeof paymentUrl === "string" && paymentUrl.includes("mock-pay")) {
        // Dev/mock gateway — settle the payment immediately, then refresh balance.
        const pay = await authFetch(`/payments/deposit/mock-pay/${paymentRef}`);
        if (!pay.ok) throw new Error("Mock payment failed.");
        await refreshUser();
        setSuccess(`Deposit of ${formatMoney(Number(amount), "TND")} confirmed.`);
        setAmount("");
      } else if (typeof paymentUrl === "string") {
        // Live Konnect checkout — hand off to the hosted payment page.
        window.location.href = paymentUrl;
      } else {
        throw new Error("No payment URL returned.");
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = user?.balance ?? 0;

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">

      {/* CARD */}
      <div className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-2xl p-8 shadow-xl border border-white/50">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center text-white mb-4">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>

          <h1 className="text-3xl font-bold">Add Balance</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Top up your wallet to participate in auctions
          </p>
        </div>

        {/* CURRENT BALANCE */}
        <div className="flex justify-between items-center bg-surface-container-low rounded-xl p-4 mb-6">
          <div>
            <p className="text-xs uppercase text-outline">Current Balance</p>
            <p className="text-xl font-bold text-primary">{formatMoney(currentBalance, "TND")}</p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-outline">Status</p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {user?.email_verified !== false ? "Verified" : "Unverified"}
            </p>
          </div>
        </div>

        {/* BANNERS */}
        {hasCard === false && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">credit_card_off</span>
              Add a payment card before topping up.
            </span>
            <Link to="/add-card" className="font-semibold underline shrink-0">
              Add Card
            </Link>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* INPUT */}
          <div>
            <label className="text-xs uppercase text-outline block mb-2">
              Enter Deposit Amount (TND)
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                د
              </span>

              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="0.00"
                className="w-full h-14 pl-10 pr-4 rounded-full bg-white/60 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
              />
            </div>
          </div>

          {/* QUICK AMOUNTS */}
          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => quickSet(val)}
                className="h-12 rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition"
              >
                +{val.toLocaleString()} TND
              </button>
            ))}
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <p className="text-xs uppercase text-outline mb-2">Payment Method</p>
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/5">
              <div>
                <p className="font-semibold">Konnect Gateway</p>
                <p className="text-xs text-gray-500">Card · e-DINAR · Wallet</p>
              </div>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || hasCard === false}
            className="w-full h-14 bg-primary text-white rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">{loading ? "progress_activity" : "lock"}</span>
            {loading ? "Processing…" : "Confirm Deposit"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Funds are secured and available instantly after confirmation.
          </p>
        </form>
      </div>
    </main>
  );
}
