import React, { useEffect } from 'react';

interface PreviewModalProps {
  open: boolean;
  title: string;
  url: string;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ open, title, url, onClose }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handler);
    }
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-[80vh] rounded-lg shadow-xl overflow-hidden border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900 line-clamp-1" title={title}>{title}</h2>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline">Abrir em nova aba</a>
            <button onClick={onClose} className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">Fechar</button>
          </div>
        </div>
        <iframe title={title} src={url} className="w-full h-full" />
      </div>
    </div>
  );
};


