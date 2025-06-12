'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  DollarSign, 
  UserX, 
  TrendingUp, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  Waves,
  Coffee,
  Sun,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Wallet,
  Gift
} from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [reoni, setReoni] = useState([
    { id: 'A', naziv: 'Reon A', ukupno_lezaljki: 100, izdato: 15, cena_po_lezaljci: 250 },
    { id: 'B', naziv: 'Reon B', ukupno_lezaljki: 40, izdato: 8, cena_po_lezaljci: 250 },
    { id: 'C', naziv: 'Reon C', ukupno_lezaljki: 60, izdato: 22, cena_po_lezaljci: 250 }
  ]);

  const [transakcije, setTransakcije] = useState([
    { id: 1, reon_naziv: 'Reon A', broj_lezaljki: 5, tip: 'naplata', iznos: 1250, datum_vreme: new Date('2024-06-12T10:30:00').toISOString() },
    { id: 2, reon_naziv: 'Reon B', broj_lezaljki: 3, tip: 'oslobodjen', iznos: 0, opis: 'VIP gost - odobreno od menadzera', datum_vreme: new Date('2024-06-12T11:00:00').toISOString() },
    { id: 3, reon_naziv: 'Reon A', broj_lezaljki: 10, tip: 'naplata', iznos: 2500, datum_vreme: new Date('2024-06-12T11:30:00').toISOString() }
  ]);

  const [izvestaji, setIzvestaji] = useState([
    {
      id: 1,
      datum: '2024-06-10',
      ukupan_prihod: 15750,
      ukupno_naplaceno: 63,
      ukupno_oslobodjeno: 7,
      reoni: [
        { reon_id: 'A', naziv: 'Reon A', naplaceno: 25, oslobodjeno: 2, prihod: 6250 },
        { reon_id: 'B', naziv: 'Reon B', naplaceno: 18, oslobodjeno: 3, prihod: 4500 },
        { reon_id: 'C', naziv: 'Reon C', naplaceno: 20, oslobodjeno: 2, prihod: 5000 }
      ]
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedReon, setSelectedReon] = useState(null);
  const [brojLezaljki, setBrojLezaljki] = useState('');
  const [tipNaplate, setTipNaplate] = useState('naplata');
  const [opis, setOpis] = useState('');
  const [aktivanTab, setAktivanTab] = useState('placeno');

  useEffect(() => {
    setMounted(true);
  }, []);

  const ukupanPrihod = transakcije
    .filter(t => t.tip === 'naplata')
    .reduce((sum, t) => sum + t.iznos, 0);

  const ukupnoIzdato = transakcije.reduce((sum, t) => sum + t.broj_lezaljki, 0);
  const ukupnoLezaljki = reoni.reduce((sum, r) => sum + r.ukupno_lezaljki, 0);

  const placeneTransakcije = transakcije.filter(t => t.tip === 'naplata');
  const oslobodjeneTransakcije = transakcije.filter(t => t.tip === 'oslobodjen');

  // Inline gradijenti
  const gradients = {
    emerald: 'linear-gradient(135deg, #10b981, #059669)',
    blue: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    purple: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    amber: 'linear-gradient(135deg, #f59e0b, #d97706)',
    rose: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    indigo: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    mainBg: 'linear-gradient(135deg, #f8fafc, #e0e7ff, #dbeafe)'
  };

  const getReonnGradient = (id) => {
    const colors = {
      'A': gradients.blue,
      'B': gradients.emerald,
      'C': gradients.purple
    };
    return colors[id] || gradients.blue;
  };

  const formatNumber = (num) => {
    if (!mounted) return '0'; // Prevent hydration mismatch
    return new Intl.NumberFormat('sr-RS').format(num);
  };

  const formatTime = (dateString) => {
    if (!mounted) return '00:00'; // Prevent hydration mismatch
    return new Date(dateString).toLocaleTimeString('sr-RS', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    if (!mounted) return ''; // Prevent hydration mismatch
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const otvoriModal = (reon) => {
    setSelectedReon(reon);
    setShowModal(true);
    setBrojLezaljki('');
    setTipNaplate('naplata');
    setOpis('');
  };

  const potvrdiTransakciju = () => {
    const broj = parseInt(brojLezaljki);
    if (!broj || broj <= 0) return;

    const dostupno = selectedReon.ukupno_lezaljki - selectedReon.izdato;
    if (broj > dostupno) {
      alert(`Dostupno je samo ${dostupno} lezaljki u ${selectedReon.naziv}`);
      return;
    }

    if (tipNaplate === 'oslobodjen' && !opis.trim()) {
      alert('Opis je obavezan za oslobođene transakcije');
      return;
    }

    setReoni(prev => prev.map(reon => {
      if (reon.id === selectedReon.id) {
        return { ...reon, izdato: reon.izdato + broj };
      }
      return reon;
    }));

    const novaTransakcija = {
      id: Date.now(),
      reon_naziv: selectedReon.naziv,
      broj_lezaljki: broj,
      tip: tipNaplate,
      iznos: tipNaplate === 'naplata' ? broj * selectedReon.cena_po_lezaljci : 0,
      opis: opis || null,
      datum_vreme: new Date().toISOString()
    };

    setTransakcije(prev => [novaTransakcija, ...prev]);
    setShowModal(false);
  };

  const handleZavrsiDan = () => {
    if (confirm('Da li želite da završite dan i napravite izveštaj?')) {
      const noviIzvestaj = {
        id: Date.now(),
        datum: new Date().toISOString().split('T')[0],
        ukupan_prihod: ukupanPrihod,
        ukupno_naplaceno: placeneTransakcije.reduce((sum, t) => sum + t.broj_lezaljki, 0),
        ukupno_oslobodjeno: oslobodjeneTransakcije.reduce((sum, t) => sum + t.broj_lezaljki, 0),
        reoni: reoni.map(reon => {
          const reonTransakcije = transakcije.filter(t => t.reon_naziv === reon.naziv);
          const naplaceno = reonTransakcije.filter(t => t.tip === 'naplata').reduce((sum, t) => sum + t.broj_lezaljki, 0);
          const oslobodjeno = reonTransakcije.filter(t => t.tip === 'oslobodjen').reduce((sum, t) => sum + t.broj_lezaljki, 0);
          const prihod = reonTransakcije.filter(t => t.tip === 'naplata').reduce((sum, t) => sum + t.iznos, 0);
          
          return {
            reon_id: reon.id,
            naziv: reon.naziv,
            naplaceno,
            oslobodjeno,
            prihod
          };
        })
      };

      setIzvestaji(prev => [noviIzvestaj, ...prev]);
      
      // Reset za novi dan
      setReoni(prev => prev.map(reon => ({ ...reon, izdato: 0 })));
      setTransakcije([]);
      
      alert('Dnevni izveštaj je uspešno kreiran!');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Učitavanje...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: gradients.mainBg}}>
      {/* Header */}
      <div className="sticky top-0 z-40" style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 rounded-xl" style={{background: gradients.blue}}>
                <Waves className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Aqua caffe&restaurant
              </h1>
              <div className="p-2 rounded-xl" style={{background: gradients.amber}}>
                <Coffee className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600 text-sm">Sistem kontrole lezaljki</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl text-white shadow-xl" style={{background: gradients.emerald}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Dnevni prihod</p>
                <p className="text-2xl font-bold">{formatNumber(ukupanPrihod)} RSD</p>
              </div>
              <DollarSign className="w-8 h-8 text-white/80" />
            </div>
          </div>
          
          <div className="p-6 rounded-2xl text-white shadow-xl" style={{background: gradients.blue}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Izdato lezaljki</p>
                <p className="text-2xl font-bold">{ukupnoIzdato}/{ukupnoLezaljki}</p>
                <p className="text-white/70 text-xs mt-1">{Math.round((ukupnoIzdato/ukupnoLezaljki)*100)}% kapaciteta</p>
              </div>
              <Users className="w-8 h-8 text-white/80" />
            </div>
          </div>
          
          <div className="p-6 rounded-2xl text-white shadow-xl" style={{background: gradients.purple}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Transakcije</p>
                <p className="text-2xl font-bold">{transakcije.length}</p>
                <p className="text-white/70 text-xs mt-1">danas</p>
              </div>
              <TrendingUp className="w-8 h-8 text-white/80" />
            </div>
          </div>
        </div>

        {/* Reoni Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {reoni.map(reon => {
            const dostupno = reon.ukupno_lezaljki - reon.izdato;
            const procenat = (reon.izdato / reon.ukupno_lezaljki) * 100;
            const gradient = getReonnGradient(reon.id);
            
            return (
              <div key={reon.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                         style={{background: gradient}}>
                      {reon.id}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{reon.naziv}</h3>
                      <div className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        {dostupno} <span className="text-lg text-gray-500 font-normal">od {reon.ukupno_lezaljki}</span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatNumber(reon.cena_po_lezaljci)} RSD po lezaljci
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => otvoriModal(reon)}
                    disabled={dostupno === 0}
                    className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                    style={dostupno === 0 ? 
                      {background: '#9ca3af', cursor: 'not-allowed'} : 
                      {background: gradient}
                    }
                  >
                    {dostupno === 0 ? 'Popunjeno' : 'Izdaj lezaljke'}
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="h-4 rounded-full transition-all duration-500 shadow-sm"
                         style={{background: gradient, width: `${procenat}%`}}>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{Math.round(procenat)}% popunjeno</span>
                    <span className="font-medium text-gray-700">{reon.izdato} izdato</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish Day Button */}
        {transakcije.length > 0 && (
          <div className="text-center mb-8">
            <button 
              onClick={handleZavrsiDan}
              className="text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center gap-3 mx-auto"
              style={{background: gradients.indigo}}
            >
              <Calendar className="w-5 h-5" />
              Završi dan i napravi izveštaj
            </button>
          </div>
        )}

        {/* Transaction History */}
        {transakcije.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Istorija transakcija
            </h3>
            
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setAktivanTab('placeno')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  aktivanTab === 'placeno'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={aktivanTab === 'placeno' ? {background: gradients.emerald} : {}}
              >
                Plaćeno ({placeneTransakcije.length})
              </button>
              <button
                onClick={() => setAktivanTab('oslobodjeno')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  aktivanTab === 'oslobodjeno'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={aktivanTab === 'oslobodjeno' ? {background: gradients.rose} : {}}
              >
                Oslobođeno ({oslobodjeneTransakcije.length})
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(aktivanTab === 'placeno' ? placeneTransakcije : oslobodjeneTransakcije).map(transakcija => (
                <div 
                  key={transakcija.id} 
                  className="p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md"
                  style={{
                    borderLeftColor: transakcija.tip === 'naplata' ? '#10b981' : '#ef4444',
                    background: transakcija.tip === 'naplata' 
                      ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' 
                      : 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-800">{transakcija.reon_naziv}</span>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                          {formatTime(transakcija.datum_vreme)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {transakcija.broj_lezaljki} lezaljki × 250 RSD
                      </div>
                      {transakcija.opis && transakcija.tip === 'oslobodjen' && (
                        <div className="text-sm text-gray-700 italic bg-white p-2 rounded-lg mt-2">
                          &ldquo;{transakcija.opis}&rdquo;
                        </div>
                      )}
                    </div>
                    <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                      transakcija.tip === 'naplata' 
                        ? 'text-emerald-700 bg-emerald-200' 
                        : 'text-red-700 bg-red-200'
                    }`}>
                      {transakcija.tip === 'naplata' 
                        ? `+${formatNumber(transakcija.iznos)} RSD`
                        : 'BESPLATNO'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Reports */}
        {izvestaji.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              Dnevni izveštaji
            </h3>
            <div className="space-y-6">
              {izvestaji.map((izvestaj) => (
                <div key={izvestaj.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <h4 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      {formatDate(izvestaj.datum)}
                    </h4>
                    <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      {formatNumber(izvestaj.ukupan_prihod)} RSD
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {izvestaj.reoni.map(reon => (
                      <div key={reon.reon_id} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="font-semibold text-gray-800 mb-2">{reon.naziv}</div>
                        <div className="text-sm text-emerald-600 mb-1">✓ Naplaćeno: {reon.naplaceno}</div>
                        <div className="text-sm text-red-600 mb-2">⊘ Besplatno: {reon.oslobodjeno}</div>
                        <div className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-full">
                          {formatNumber(reon.prihod)} RSD
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 pt-4 border-t border-gray-200 gap-2">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Ukupno naplaćeno: <strong className="text-emerald-600">{izvestaj.ukupno_naplaceno}</strong> lezaljki
                    </span>
                    <span className="flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      Ukupno besplatno: <strong className="text-red-600">{izvestaj.ukupno_oslobodjeno}</strong> lezaljki
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" 
               style={{background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)'}}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">
                Izdavanje lezaljki - {selectedReon?.naziv}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Broj lezaljki
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedReon?.ukupno_lezaljki - selectedReon?.izdato}
                    value={brojLezaljki}
                    onChange={(e) => setBrojLezaljki(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Unesite broj"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tip naplate
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="naplata"
                        checked={tipNaplate === 'naplata'}
                        onChange={(e) => setTipNaplate(e.target.value)}
                        className="mr-3"
                      />
                      <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                      <span>Naplata ({formatNumber(selectedReon?.cena_po_lezaljci || 0)} RSD po lezaljci)</span>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        value="oslobodjen"
                        checked={tipNaplate === 'oslobodjen'}
                        onChange={(e) => setTipNaplate(e.target.value)}
                        className="mr-3"
                      />
                      <UserX className="w-5 h-5 mr-2 text-red-600" />
                      <span>Oslobođen naplate</span>
                    </label>
                  </div>
                </div>

                {tipNaplate === 'oslobodjen' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Opis (obavezno za oslobođene)
                    </label>
                    <textarea
                      value={opis}
                      onChange={(e) => setOpis(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ko je oslobođen i ko je odobrio..."
                      rows="3"
                    />
                  </div>
                )}

                {brojLezaljki && (
                  <div className="p-4 rounded-xl border border-blue-200"
                       style={{background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)'}}>
                    <div className="text-sm text-gray-600 mb-1">Pregled:</div>
                    <div className="font-semibold text-lg">
                      {brojLezaljki} lezaljki × {formatNumber(selectedReon?.cena_po_lezaljci || 0)} RSD = {' '}
                      <span className={tipNaplate === 'naplata' ? 'text-emerald-600' : 'text-red-600'}>
                        {tipNaplate === 'naplata' 
                          ? `${formatNumber(parseInt(brojLezaljki) * (selectedReon?.cena_po_lezaljci || 0))} RSD`
                          : '0 RSD (besplatno)'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Otkaži
                </button>
                <button
                  onClick={potvrdiTransakciju}
                  disabled={!brojLezaljki || (tipNaplate === 'oslobodjen' && !opis.trim())}
                  className="flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  style={!brojLezaljki || (tipNaplate === 'oslobodjen' && !opis.trim()) ? 
                    {background: '#9ca3af', cursor: 'not-allowed'} : 
                    {background: gradients.blue}
                  }
                >
                  Potvrdi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}