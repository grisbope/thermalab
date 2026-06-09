import { Download } from 'lucide-react';

interface ExportButtonProps {
  filename: string;
  data: unknown;
  label?: string;
}

export function ExportButton({ filename, data, label = 'Exportar datos' }: ExportButtonProps) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/12 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/20 active:scale-[0.98]"
    >
      <Download size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
