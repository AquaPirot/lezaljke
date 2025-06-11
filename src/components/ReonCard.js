'use client';

export default function ReonCard({ reon, onIzdajClick }) {
  const dostupno = reon.ukupno_lezaljki - reon.izdato;
  const procenat = (reon.izdato / reon.ukupno_lezaljki) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${reon.boja} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}>
            {reon.id}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{reon.naziv}</h3>
            <div className="text-3xl font-bold text-gray-900">
              {dostupno} <span className="text-lg text-gray-500">od {reon.ukupno_lezaljki}</span>
            </div>
            <div className="text-sm text-gray-600">
              {reon.cena_po_lezaljci} RSD po lezaljci
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onIzdajClick(reon)}
          disabled={dostupno === 0}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            dostupno === 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {dostupno === 0 ? 'Popunjeno' : 'Izdaj lezaljke'}
        </button>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${reon.boja}`}
          style={{ width: `${procenat}%` }}
        ></div>
      </div>
      <div className="text-right text-sm text-gray-600 mt-1">
        {Math.round(procenat)}% popunjeno
      </div>
    </div>
  );
}