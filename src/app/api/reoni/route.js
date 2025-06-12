import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Najpre testiraj osnovni SELECT
    const reoni = await executeQuery('SELECT * FROM reoni ORDER BY id');
    
    // Dodaj informaciju o izdatim lezaljkama za svaki reon
    for (let reon of reoni) {
      try {
        const [izdatoResult] = await executeQuery(`
          SELECT COALESCE(SUM(broj_lezaljki), 0) as izdato
          FROM transakcije 
          WHERE reon_id = ? AND DATE(datum_vreme) = CURDATE()
        `, [reon.id]);
        
        reon.izdato = izdatoResult ? izdatoResult.izdato : 0;
      } catch (err) {
        console.log('Greška pri računanju izdatih:', err);
        reon.izdato = 0;
      }
    }

    return NextResponse.json(reoni);
  } catch (error) {
    console.error('Error fetching reoni:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reoni', 
      details: error.message 
    }, { status: 500 });
  }
}