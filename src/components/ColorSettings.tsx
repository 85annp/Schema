"use client";

interface ColorSettingsProps {
  subjects: string[];
  colors: Record<string, string>;
  onChange: (subject: string, color: string) => void;
}

export default function ColorSettings({ subjects, colors, onChange }: ColorSettingsProps) {
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const getDeterministicColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return hslToHex(h, 70, 85);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 animate-in fade-in slide-in-from-top-2">
      <h3 className="font-bold mb-3 border-b pb-2">Färginställningar per ämne/grupp</h3>
      <p className="text-sm text-gray-500 mb-4">Välj en färg för varje ämne. Färgvalen sparas automatiskt i din webbläsare.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
            <span className="text-sm font-medium truncate pr-2" title={subject}>
              {subject}
            </span>
            <input
              type="color"
              value={colors[subject] || getDeterministicColor(subject)}
              onChange={(e) => onChange(subject, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer shrink-0 border-0 p-0"
              title={`Välj färg för ${subject}`}
            />
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full text-sm text-gray-500 italic">Inga ämnen hittades i detta schema.</div>
        )}
      </div>
    </div>
  );
}
