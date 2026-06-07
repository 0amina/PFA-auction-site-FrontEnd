// index.tsx — CreateAuctionPage entry point
// Composes: AuctionForm + TipsSidebar
// Owns: form state (via hook), image files, submit handler (→ auction-service)
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormState } from './useFormState';
import AuctionForm from './AuctionForm';
import TipsSidebar from './TipsSidebar';
import { createAuction } from '../../lib/createAuction';
import { useAuth } from '../../context/AuthContext';

export default function CreateAuctionPage() {
  const { form, setField, isValid } = useFormState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflect the real linked wallet so the SOL submit gate matches the account.
  useEffect(() => {
    const wallet = user?.wallet_address ?? '';
    setField('walletConnected', !!wallet);
    setField('walletAddress', wallet);
  }, [user?.wallet_address, setField]);

  const submit = useCallback(async () => {
    setError(null);
    if (form.bidMethod === 'SOL' && !user?.wallet_address) {
      setError('Connect your Phantom wallet (Profile → Wallet) before creating a SOL auction.');
      return;
    }
    setSubmitting(true);
    try {
      const auction = await createAuction(form, files);
      navigate(`/auctions/${auction.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong creating your auction.');
    } finally {
      setSubmitting(false);
    }
  }, [form, files, user?.wallet_address, navigate]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    void submit();
  }, [isValid, submitting, submit]);

  return (
    <main className="pt-16 pb-24 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
      <div className="flex-grow max-w-3xl">
        <header className="mb-12 pt-8">
          <h1 className="text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
            Curate a New Lot
          </h1>
          <p className="text-on-surface-variant font-body text-lg leading-relaxed">
            Present your piece to the world's most discerning collectors. Precision in detail ensures the highest final hammer price.
          </p>
        </header>
        <AuctionForm
          form={form}
          setField={setField}
          isValid={isValid}
          onFilesChange={setFiles}
          onSubmit={handleSubmit}
          onSaveDraft={() => { if (isValid && !submitting) void submit(); }}
          submitting={submitting}
          error={error}
        />
      </div>
      <TipsSidebar />
    </main>
  );
}
