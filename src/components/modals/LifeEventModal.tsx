import { useState, useRef } from 'react';
import { X, Upload, FileImage, FileText, Film, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_TYPES = [
  { id: 'illness', label: 'Illness', emoji: '🤒' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'medication', label: 'Medication', emoji: '💊' },
  { id: 'social', label: 'Social', emoji: '🎉' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'stress', label: 'Stress', emoji: '😰' },
  { id: 'other', label: 'Other', emoji: '📝' },
];

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

function fileIcon(f: File) {
  if (f.type.startsWith('image/')) return <FileImage className="w-4 h-4 text-[var(--teal)]" />;
  if (f.type.startsWith('video/')) return <Film className="w-4 h-4 text-purple-500" />;
  return <FileText className="w-4 h-4 text-[var(--blue)]" />;
}

interface Props {
  onClose: () => void;
  initialDate?: string;
}

export function LifeEventModal({ onClose, initialDate }: Props) {
  const [type, setType] = useState('exercise');
  const [date, setDate] = useState(initialDate ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: AttachedFile[] = Array.from(incoming).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleSave = () => {
    if (!type) return;
    toast.success('Life event logged successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-[var(--bg-white)] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-token)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Log a life event</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Event type */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Event type</p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((t) => (
                <button key={t.id} type="button" onClick={() => setType(t.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors font-medium ${type === t.id ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-secondary)] hover:border-slate-300'}`}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="event-date" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide block mb-2">Date</label>
            <input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 w-full" />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="event-note" className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide block mb-2">Note</label>
            <textarea id="event-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what happened..."
              className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 resize-none" />
          </div>

          {/* File upload */}
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Evidence (optional)</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center gap-2 p-5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dragOver ? 'border-[var(--teal)] bg-[var(--badge-teal-bg)]' : 'border-[var(--border-token)] hover:border-[var(--teal)]'}`}
            >
              <Upload className="w-5 h-5 text-[var(--text-muted)]" />
              <p className="text-xs text-[var(--text-muted)] text-center">
                Drag &amp; drop or <span className="text-[var(--teal)] font-medium">browse</span><br />
                Images, videos, or documents
              </p>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx"
                className="sr-only" onChange={(e) => addFiles(e.target.files)} />
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--border-token)] bg-[var(--bg-surface)]">
                    {f.preview
                      ? <img src={f.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      : <div className="w-10 h-10 rounded-lg bg-[var(--bg-app)] flex items-center justify-center shrink-0">{fileIcon(f.file)}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{f.file.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{(f.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={() => removeFile(f.id)} aria-label="Remove file"
                      className="p-1.5 rounded-lg hover:bg-[var(--state-error-bg)] text-[var(--text-muted)] hover:text-[var(--state-error-text)] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[var(--border-token)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-[var(--teal)] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Save event
          </button>
        </div>
      </div>
    </div>
  );
}
