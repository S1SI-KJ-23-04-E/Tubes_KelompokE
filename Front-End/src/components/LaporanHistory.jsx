import React from 'react';
import { Clock } from 'lucide-react';

export default function LaporanHistory({ history = [], canView = false }) {
  if (!canView) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-bold mb-2">Riwayat Perubahan</h2>
        <p className="text-sm text-gray-500">Hanya akun kecamatan/super admin yang dapat melihat riwayat laporan.</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="font-bold mb-2">Riwayat Perubahan</h2>
        <p className="text-sm text-gray-500">Belum ada riwayat untuk laporan ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-6">
      <h2 className="font-bold mb-4">Riwayat Perubahan</h2>
      <ul className="space-y-3">
        {history.map((h) => (
          <li key={h.id} className="flex items-start space-x-3">
            <div className="text-gray-400 mt-1">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold mr-2">{h.status}</span>
                <span className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</span>
              </div>
              {h.catatan && <div className="text-sm text-gray-600 mt-1">Catatan: {h.catatan}</div>}
              {h.changed_by && <div className="text-xs text-gray-500 mt-1">Diubah oleh: {h.changed_by}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
