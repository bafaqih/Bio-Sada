import { Loader2, Recycle } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
        <Recycle className="h-8 w-8 text-white" />
      </div>
      <div className="flex items-center gap-2 text-emerald-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Memuat aplikasi...</span>
      </div>
    </div>
  );
}
