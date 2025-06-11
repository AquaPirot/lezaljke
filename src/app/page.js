'use client';

import { useState, useEffect } from 'react';
import { DollarSign, UserX, TrendingUp, Users, Calendar } from 'lucide-react';

export default function Home() {
 const [reoni, setReoni] = useState([]);
 const [transakcije, setTransakcije] = useState([]);
 const [izvestaji, setIzvestaji] = useState([]);
 const [showModal, setShowModal] = useState(false);
 const [selectedReon, setSelectedReon] = useState(null);
 const [ukupanPrihod, setUkupanPrihod] = useState(0);
 const [loading, setLoading] = useState(true);
 const [aktivanTab, setAktivanTab] = useState('placeno');
 const [brojLezaljki, setBrojLezaljki] = useState('');
 const [tipNaplate, setTipNaplate] = useState('naplata');
 const [opis, setOpis] = useState('');

 useEffect(() => {
   loadData();
 }, []);

 const loadData = async () => {
   try {
     setLoading(true);
     const [reoniRes, transakcijeRes, izvestajiRes] = await Promise.all([
       fetch('/api/reoni'),
       fetch('/api/transakcije'),
       fetch('/api/izvestaji')
     ]);

     const reoniData = await reoniRes.json();
     const transakcijeData = await transakcijeRes.json();
     const izvestajiData = await izvestajiRes.json();

     setReoni(Array.isArray(reoniData) ? reoniData : []);
     setTransakcije(Array.isArray(transakcijeData) ? transakcijeData : []);
     setIzvestaji(Array.isArray(izvestajiData) ? izvestajiData : []);

     const prihod = Array.isArray(transakcijeData) 
       ? transakcijeData
         .filter(t => t.tip === 'naplata')
         .reduce((sum, t) => sum + parseFloat(t.iznos), 0)
       : 0;
     setUkupanPrihod(prihod);
   } catch (error) {
     console.error('Error loading data:', error);
   } finally {
     setLoading(false);
   }
 };

 const handleNovaTransakcija = async (podaci) => {
   try {
     const response = await fetch('/api/transakcije', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(podaci)
     });

     if (response.ok) {
       loadData();
       setShowModal(false);
       setBrojLezaljki('');
       setTipNaplate('naplata');
       setOpis('');
     } else {
       const error = await response.json();
       alert('Greška: ' + error.error);
     }
   } catch (error) {
     console.error('Error creating transakcija:', error);
     alert('Greška pri kreiranju transakcije');
   }
 };

 const handleZavrsiDan = async () => {
   if (confirm('Da li želite da završite dan i napravite izveštaj?')) {
     try {
       const response = await fetch('/api/izvestaji', {
         method: 'POST'
       });

       if (response.ok) {
         loadData();
         alert('Dnevni izveštaj je uspešno kreiran!');
       } else {
         const error = await response.json();
         alert('Greška: ' + error.error);
       }
     } catch (error) {
       console.error('Error finishing day:', error);
       alert('Greška pri kreiranju izveštaja');
     }
   }
 };

 const potvrdiTransakciju = () => {
   const broj = parseInt(brojLezaljki);
   if (!broj || broj <= 0) {
     alert('Molimo unesite valjan broj lezaljki');
     return;
   }

   const dostupno = selectedReon.ukupno_lezaljki - selectedReon.izdato;
   if (broj > dostupno) {
     alert(`Dostupno je samo ${dostupno} lezaljki u ${selectedReon.naziv}`);
     return;
   }

   if (tipNaplate === 'oslobodjen' && !opis.trim()) {
     alert('Opis je obavezan za oslobođene transakcije');
     return;
   }

   handleNovaTransakcija({
     reon_id: selectedReon.id,
     broj_lezaljki: broj,
     tip: tipNaplate,
     opis: opis.trim() || null
   });
 };

 const ukupnoIzdato = Array.isArray(transakcije) 
   ? transakcije.reduce((sum, t) => sum + t.broj_lezaljki, 0) 
   : 0;
 const ukupnoLezaljki = Array.isArray(reoni) 
   ? reoni.reduce((sum, r) => sum + r.ukupno_lezaljki, 0) 
   : 0;

 const placeneTransakcije = transakcije.filter(t => t.tip === 'naplata');
 const oslobodjeneTransakcije = transakcije.filter(t => t.tip === 'oslobodjen');

 if (loading) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
       <div className="text-2xl font-bold text-gray-600">Učitavanje...</div>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
     {/* Header */}
     <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
         <div className="text-center">
           <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
             Aqua caffe&restaurant
           </h1>
           <p className="text-gray-600 text-sm mt-1">Sistem kontrole lezaljki</p>
         </div>
       </div>
     </div>

     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {/* Stats Cards */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-xl">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-white/80 text-sm font-medium">Dnevni prihod</p>
               <p className="text-2xl font-bold">{ukupanPrihod.toLocaleString()} RSD</p>
             </div>
             <DollarSign className="w-8 h-8 text-white/80" />
           </div>
         </div>
         
         <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-xl">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-white/80 text-sm font-medium">Izdato lezaljki</p>
               <p className="text-2xl font-bold">{ukupnoIzdato}/{ukupnoLezaljki}</p>
               <p className="text-white/70 text-xs mt-1">{ukupnoLezaljki > 0 ? Math.round((ukupnoIzdato/ukupnoLezaljki)*100) : 0}% kapaciteta</p>
             </div>
             <Users className="w-8 h-8 text-white/80" />
           </div>
         </div>
         
         <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
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
         {Array.isArray(reoni) && reoni.length > 0 && reoni.map(reon => {
           const dostupno = reon.ukupno_lezaljki - reon.izdato;
           const procenat = (reon.izdato / reon.ukupno_lezaljki) * 100;
           
           return (
             <div key={reon.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                   <div className={`w-16 h-16 ${reon.boja} rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                     {reon.id}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-800">{reon.naziv}</h3>
                     <div className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                       {dostupno} <span className="text-lg text-gray-500 font-normal">od {reon.ukupno_lezaljki}</span>
                     </div>
                     <div className="text-sm text-gray-600 flex items-center gap-1">
                       <DollarSign className="w-4 h-4" />
                       {reon.cena_po_lezaljci} RSD po lezaljci
                     </div>
                   </div>
                 </div>
                 
                 <button
                   onClick={() => {
                     setSelectedReon(reon);
                     setShowModal(true);
                     setBrojLezaljki('');
                     setTipNaplate('naplata');
                     setOpis('');
                   }}
                   disabled={dostupno === 0}
                   className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${
                     dostupno === 0 
                       ? 'bg-gray-400 cursor-not-allowed' 
                       : `${reon.boja} hover:shadow-xl`
                   }`}
                 >
                   {dostupno === 0 ? 'Popunjeno' : 'Izdaj lezaljke'}
                 </button>
               </div>
               
               <div className="space-y-3">
                 <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                   <div 
                     className={`h-4 rounded-full transition-all duration-500 ${reon.boja} shadow-sm`}
                     style={{ width: `${procenat}%` }}
                   ></div>
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
             className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center gap-3 mx-auto"
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
                   ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               Plaćeno ({placeneTransakcije.length})
             </button>
             <button
               onClick={() => setAktivanTab('oslobodjeno')}
               className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                 aktivanTab === 'oslobodjeno'
                   ? 'bg-red-500 text-white shadow-lg transform scale-105'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               Oslobođeno ({oslobodjeneTransakcije.length})
             </button>
           </div>

           <div className="space-y-4 max-h-96 overflow-y-auto">
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
                   className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                     transakcija.tip === 'naplata' 
                       ? 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100' 
                       : 'border-red-500 bg-red-50 hover:bg-red-100'
                   }`}
                 >
                   <div className="flex justify-between items-start">
                     <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                         <span className="font-semibold text-gray-800">{transakcija.reon_naziv}</span>
                         <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                           {vreme}
                         </span>
                       </div>
                       <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                         <Users className="w-4 h-4" />
                         {transakcija.broj_lezaljki} lezaljki × 250 RSD
                       </div>
                       {transakcija.opis && transakcija.tip === 'oslobodjen' && (
                         <div className="text-sm text-gray-700 italic bg-white p-2 rounded-lg mt-2">
                           "{transakcija.opis}"
                         </div>
                       )}
                     </div>
                     <div className={`text-lg font-bold px-3 py-1 rounded-full ${
                       transakcija.tip === 'naplata' 
                         ? 'text-emerald-700 bg-emerald-200' 
                         : 'text-red-700 bg-red-200'
                     }`}>
                       {transakcija.tip === 'naplata' 
                         ? `+${Number(transakcija.iznos).toLocaleString()} RSD`
                         : 'BESPLATNO'
                       }
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
       )}

       {/* Daily Reports */}
       {Array.isArray(izvestaji) && izvestaji.length > 0 && (
         <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
           <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
             <Calendar className="w-6 h-6 text-purple-600" />
             Dnevni izveštaji
           </h3>
           <div className="space-y-6">
             {izvestaji.map((izvestaj) => {
               const datum = new Date(izvestaj.datum).toLocaleDateString('sr-RS');
               
               return (
                 <div key={izvestaj.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                     <h4 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
                       <Calendar className="w-5 h-5 text-blue-600" />
                       {datum}
                     </h4>
                     <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                       {Number(izvestaj.ukupan_prihod).toLocaleString()} RSD
                     </div>
                   </div>
                   
                   {Array.isArray(izvestaj.reoni) && izvestaj.reoni.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                       {izvestaj.reoni.map(reon => (
                         <div key={reon.reon_id} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                           <div className="font-semibold text-gray-800 mb-2">{reon.naziv}</div>
                           <div className="text-sm text-emerald-600 mb-1">✓ Naplaćeno: {reon.naplaceno}</div>
                           <div className="text-sm text-red-600 mb-2">⊘ Besplatno: {reon.oslobodjeno}</div>
                           <div className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded-full">
                             {Number(reon.prihod).toLocaleString()} RSD
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                   
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
               );
             })}
           </div>
         </div>
       )}

       {/* Modal */}
       {showModal && selectedReon && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
             <h3 className="text-2xl font-bold mb-6 text-gray-800">
               Izdavanje lezaljki - {selectedReon.naziv}
             </h3>
             
             <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-3">
                   Broj lezaljki
                 </label>
                 <input
                   type="number"
                   min="1"
                   max={selectedReon.ukupno_lezaljki - selectedReon.izdato}
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
                     <span>Naplata ({selectedReon.cena_po_lezaljci} RSD po lezaljci)</span>
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
                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                   <div className="text-sm text-gray-600 mb-1">Pregled:</div>
                   <div className="font-semibold text-lg">
                     {brojLezaljki} lezaljki × {selectedReon.cena_po_lezaljci} RSD = {' '}
                     <span className={tipNaplate === 'naplata' ? 'text-emerald-600' : 'text-red-600'}>
                       {tipNaplate === 'naplata' 
                         ? `${parseInt(brojLezaljki) * selectedReon.cena_po_lezaljci} RSD`
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
                 className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-105"
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