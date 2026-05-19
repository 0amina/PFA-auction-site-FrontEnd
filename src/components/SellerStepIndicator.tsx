// src/components/SellerStepIndicator.tsx

interface Props {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { number: 1, label: 'Identity' },
  { number: 2, label: 'Expertise' },
  { number: 3, label: 'Agreement' },
] as const;

export default function SellerStepIndicator({ currentStep }: Props) {
  return (
    <nav aria-label="Seller application progress" className="mb-12">
      <ol className="flex justify-between items-center relative">
        {/* Track line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-[#e0e3e5] -z-10" />

        {STEPS.map(({ number, label }) => {
          const isComplete = number < currentStep;
          const isActive   = number === currentStep;

          return (
            <li key={number} className="flex flex-col items-center gap-3">
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                  'ring-8 ring-[#f7f9fb] transition-all duration-300',
                  isComplete
                    ? 'bg-[#006c49] text-white'
                    : isActive
                    ? 'bg-[#3525cd] text-white shadow-md ring-[#3525cd]/10 ring-[6px]'
                    : 'bg-[#e6e8ea] text-[#464555]',
                ].join(' ')}
              >
                {isComplete ? (
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : (
                  <span className="font-[Plus_Jakarta_Sans]">{number}</span>
                )}
              </div>
              <span
                className={[
                  'font-[Inter] text-[10px] font-bold tracking-widest uppercase',
                  isComplete
                    ? 'text-[#006c49]'
                    : isActive
                    ? 'text-[#3525cd]'
                    : 'text-[#464555]/50',
                ].join(' ')}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}