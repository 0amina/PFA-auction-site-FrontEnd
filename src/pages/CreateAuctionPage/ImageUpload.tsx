// ImageUpload.tsx — drop zone + image preview grid
// Owns its own File state; notifies parent via onFilesChange so the page can
// send the actual files as multipart/form-data to the auction service.
import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  onFilesChange: (files: File[]) => void;
}

export default function ImageUpload({ onFilesChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Build/cleanup object URLs whenever the file list changes.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const open = () => fileRef.current?.click();

  const handleFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const next = [...prev, ...picked];
      onFilesChange(next);
      return next;
    });
    e.target.value = '';
  }, [onFilesChange]);

  const remove = useCallback((i: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      onFilesChange(next);
      return next;
    });
  }, [onFilesChange]);

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={open}
        className="border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center py-12 px-6 bg-surface-container-lowest cursor-pointer hover:border-primary/40 transition-colors"
      >
        <span className="material-symbols-outlined text-4xl text-primary mb-4">upload_file</span>
        <p className="font-headline font-bold text-lg">Drop high-resolution assets here</p>
        <p className="font-body text-sm text-on-surface-variant mt-2 text-center">
          JPEG, PNG and WebP supported. The first image becomes the cover.
        </p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); open(); }}
          className="mt-6 px-8 py-3 bg-surface-container-high rounded-full font-label font-semibold hover:bg-surface-variant transition-colors"
        >
          Select Files
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {/* Preview grid */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {previews.map((src, i) => (
          <div key={src} className="aspect-square rounded-xl bg-surface-container-high overflow-hidden group relative">
            <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => remove(i)} className="text-white">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        ))}
        {/* Always show 2 empty add-slots */}
        {[0, 1].map((i) => (
          <button
            key={`add-${i}`}
            type="button"
            onClick={open}
            className="aspect-square rounded-xl border-2 border-dashed border-outline-variant/20 flex items-center justify-center text-outline hover:border-primary/40 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        ))}
      </div>
    </div>
  );
}
