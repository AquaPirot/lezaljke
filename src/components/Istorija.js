'use client';

import { useState } from 'react';

export default function Istorija({ transakcije }) {
  const [aktivanTab, setAktivanTab] = useState('placeno');

  const placeneTransakcije = transakcije.filter(t => t.tip === 'naplata');
  const oslobodjeneTransakcije = transakcije.filter(t => t.tip === 'oslobodjen');

  if (transakcije.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Istorija transakcija</h3>
      
      {/* Tab dugmad */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setAktivanTab('placeno')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            aktivanTab === 'placeno'
              ? 'bg-green-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Plaćeno ({placeneTransakcije.length})
        </button>
        <button
          onClick={() => setAktivanTab('oslobodjeno')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            aktivanTab === 'oslobodjeno'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Oslobođeno ({oslobodjeneTransakcije.length})
        </button>
      </div>

      {/* Sadržaj tab-a */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {aktivanTab === 'placeno' && placeneTransakcije.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nema plaćenih transakcija
          </div>
        )}
        
        {aktivanTab === 'oslobodjeno' && oslobodjeneTransakcije.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nema oslobođenih transakcija
          </div>
        )}

        {(aktivanTab === 'placeno' ? placeneTransakcije : oslobodjeneTransakcije).map(transakcija => {
          const vreme = new Date(transakcija.datum_vreme).toLocaleTimeString('sr-RS', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          return (
            <div 
              key={transakcija.id} 
              className={`p-4 rounded-lg border-l-4 ${
                transakcija.tip === 'naplata' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{transakcija.reon_naziv}</span>
                    <span className="text-sm text-gray-500">• {vreme}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {transakcija.broj_lezaljki} lezaljki × 250 RSD
                  </div>
                  {transakcija.opis && transakcija.tip === 'oslobodjen' && (
                    <div className="text-sm text-gray-700 italic">
                      "{transakcija.opis}"
                    </div>
                  )}
                </div>
                <div className={`text-lg font-bold ${
                  transakcija.tip === 'naplata' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transakcija.tip === 'naplata' 
                    ? `+${Number(transakcija.iznos).toLocaleString()} RSD`
                    : 'OSLOBOĐENO'
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}