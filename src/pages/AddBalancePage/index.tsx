import { useState } from "react";

export default function AddBalancePage() {
  const [amount, setAmount] = useState<number | "">("");

  const quickSet = (val: number) => {
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    console.log("Deposit:", amount);

    // fake animation logic (React version)
    alert("Processing deposit...");
  };

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
            <p className="text-xl font-bold text-primary">$12,450.00</p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase text-outline">Status</p>
            <p className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Verified
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* INPUT */}
          <div>
            <label className="text-xs uppercase text-outline block mb-2">
              Enter Deposit Amount
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0.00"
                className="w-full h-14 pl-10 pr-4 rounded-full bg-white/60 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg"
              />
            </div>
          </div>

          {/* QUICK AMOUNTS */}
          <div className="grid grid-cols-3 gap-3">
            {[1000, 5000, 10000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => quickSet(val)}
                className="h-12 rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition"
              >
                +${val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <p className="text-xs uppercase text-outline mb-2">
              Payment Method
            </p>

            <div className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/5">
              <div>
                <p className="font-semibold">Amex Gold •••• 9002</p>
                <p className="text-xs text-gray-500">Expires 12/26</p>
              </div>

              <button type="button" className="text-primary text-sm">
                Change
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full h-14 bg-primary text-white rounded-full font-semibold hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">lock</span>
            Confirm Deposit
          </button>

          <p className="text-center text-xs text-gray-400">
            Funds are secured and available instantly.
          </p>
        </form>
      </div>
    </main>
  );
}