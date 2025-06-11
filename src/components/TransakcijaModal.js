'use client';

import { useState } from 'react';
import { DollarSign, UserX } from 'lucide-react';

export default function TransakcijaModal({ reon, onSave, onClose }) {
  const [brojLezaljki, setBrojLezaljki] = useState('');
  const [tipNaplate, setTipNaplate] = useState('naplata');
  const [opis, setOpis] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const broj = parseInt(brojLezaljki);
    if (!broj || broj <= 0) return;

    const dostupno = reon.ukupno_lezaljki - reon.izdato;
    if (broj > dostupno) {
      alert(`Dostupno je samo ${dostupno} lezaljki u ${reon.naziv}`);
      return;
    }

    if (tipNaplate === 'oslobodjen' && !opis.trim()) {
      alert('Opis je obavezan za oslobođene transakcije');
      return;
    }

    onSave({
      reon_id: reon.id,
      broj_lezaljki: broj,
      tip: tipNaplate,
      opis: opis.trim() || null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          Izdavanje lezaljki - {reon?.naziv}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Broj lezaljki
            </label>
            <input
              type="number"
              min="1"
              max={reon?.ukupno_lezaljki - reon?.izdato}
              value={brojLezaljki}
              onChange={(e) => setBrojLezaljki(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Unesite broj"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip naplate
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="naplata"
                  checked={tipNaplate === 'naplata'}
                  onChange={(e) => setTipNaplate(e.target.value)}
                  className="mr-2"
                />
                <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                Naplata ({reon?.cena_po_lezaljci} RSD po lezaljci)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="oslobodjen"
                  checked={tipNaplate === 'oslobodjen'}
                  onChange={(e) => setTipNaplate(e.target.value)}
                  className="mr-2"
                />
                <UserX className="w-4 h-4 mr-1 text-red-600" />
                Oslobođen naplate
              </label>
            </div>
          </div>

          {tipNaplate === 'oslobodjen' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis (obavezno za oslobođene)
              </label>
              <textarea
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ko je oslobođen i ko je odobrio..."
                rows="3"
                required={tipNaplate === 'oslobodjen'}
              />
            </div>
          )}

          {brojLezaljki && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Pregled:</div>
              <div className="font-semibold">
                {brojLezaljki} lezaljki × {reon?.cena_po_lezaljci} RSD = {' '}
                <span className={tipNaplate === 'naplata' ? 'text-green-600' : 'text-red-600'}>
                  {tipNaplate === 'naplata' 
                    ? `${parseInt(brojLezaljki) * reon?.cena_po_lezaljci} RSD`
                    : '0 RSD (oslobođeno)'
                  }
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Potvrdi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}