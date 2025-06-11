'use client';

export default function DnevniIzvestaji({ izvestaji }) {
  if (izvestaji.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">📈 Dnevni izveštaji</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {izvestaji.map((izvestaj) => {
          const datum = new Date(izvestaj.datum).toLocaleDateString('sr-RS');
          
          return (
            <div key={izvestaj.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg text-gray-800">{datum}</h4>
                <div className="text-2xl font-bold text-green-600">
                  {Number(izvestaj.ukupan_prihod).toLocaleString()} RSD
                </div>
              </div>
              
              {izvestaj.reoni && izvestaj.reoni.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-3">
                  {izvestaj.reoni.map(reon => (
                    <div key={reon.reon_id} className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-800">{reon.naziv}</div>
                      <div className="text-sm text-green-600">Naplaćeno: {reon.naplaceno}</div>
                      <div className="text-sm text-red-600">Oslobođeno: {reon.oslobodjeno}</div>
                      <div className="text-sm font-medium">{Number(reon.prihod).toLocaleString()} RSD</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                <span>Ukupno naplaćeno: <strong>{izvestaj.ukupno_naplaceno}</strong> lezaljki</span>
                <span>Ukupno oslobođeno: <strong>{izvestaj.ukupno_oslobodjeno}</strong> lezaljki</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}