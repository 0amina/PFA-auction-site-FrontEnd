// src/pages/HomePage/CollectionsGrid.tsx
// Bento-style collections category grid.

const CATEGORIES = [
  {
    label: 'Contemporary',
    sub: '842 lots available',
    span: 'md:col-span-2 md:row-span-2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_TMcfEwpy3hDeO-W9lrp8ibhkX3APQ111y3w-240TJZauxSd4Fh_lZU4bfIaSoNc40AV7-PDXTb2yQfB61WHq1ou-ag5eFNH1FysZ9HulH708ErKlj0ZGQQNsUXwte7_jr_j4gy_wB0mmobW3VEdkQIr-y9YHrU6HLgU-EPhX9bkJ9zvT2YVbBzk76kErXSj4yko7ZaJpUMxsOdMXc3i6vGIqej_whl7rFRkpjmKrORrZpm_PXBjSdxkmJH-I5MpYkbrSA79NS9fm',
    textSize: 'text-2xl',
  },
  {
    label: 'Photography',
    span: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTpBzcDCSq9sce5cP6kBIZDLxbp0FJk3uRj6xAzcacP5Vl1AcqgsONMZVxADAdIHzUcDC2vVn3J-H-vJxvWJOd9YCHuJvlFt9Skg5mHaEDlXSlkLWIlyENsbeiAk_zKs1-WWpfFZdIcy83yChqp20LlQTzXAguD9N_Hs626fseeqzjFjg_bgkO1dFRvzkcMf32wl8ompQnLM2lBWqiQo6pyORpPZAVxRNx78UyYBqhkVFX_AQZpfI1QmkWw5fZLnTsQraP_nqAgMrD',
    textSize: 'text-lg',
  },
  {
    label: 'Old Masters',
    span: '',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvx7_SPLPqI9UJMNsWV9IQ6ZqCq7xgfJb53PCDccmifKtVUriAJwSEltwkdvOOnpRyMdQ5BRtd98FCozCb8RbSJkms_5nUoHL5O-Mq3XlvrGLDFD4HvSFbu4pfJxDRajlzwC5IIcsnx-9-kZ1lMrhzaNCMirCwmMq_MB0tRdnLS87vzlCDRctq9Y32yZi9nMfLXR9mWMNqTrTo30nI2NjKfmWjDS88k1JOPEusW6GRWOy-FL2P9uVqjYjJy6IlWTe2qq66fq7r3H5B',
    textSize: 'text-lg',
  },
  {
    label: 'Sculpture',
    sub: undefined,
    span: 'md:col-span-2',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3HCpvfoEORZBPoGdctkF8NSwTJajXzKoZgpzTboN3S3F8n4FA2c0FyyfZncy5dmQDHhoXYj64cHeFuCdaI1VAc_P7cLKY8TMPe82tzlpFpTDMhQ3e482ewqPyofDl-Rd_gc9pFvqFU2x8wIEiOMiMzVai2Gpuvrq_5imQoqwRBkFnYM5VZr2DeCew5qfYeKczoc9SrwzXNMiNRL5fGIPkYTHjQg-aLXuBJntjko3XyYFSBPNw6OkUaaRezyak0FBDpvUWyqZOx6Ca',
    textSize: 'text-2xl',
  },
];

export default function CollectionsGrid() {
  return (
    <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
      <h2 className="font-headline text-4xl font-semibold text-on-surface mb-12">Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ height: '600px' }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            className={`${cat.span} relative group overflow-hidden cursor-pointer`}
            style={{ borderRadius: '1rem' }}
          >
            <img
              src={cat.image}
              alt={cat.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h4 className={`text-white font-headline ${cat.textSize} font-semibold`}>{cat.label}</h4>
              {cat.sub && <p className="text-white/70 font-body text-sm mt-1">{cat.sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
