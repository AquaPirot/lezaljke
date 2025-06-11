import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reoni = await executeQuery(`
      SELECT r.*, 
             COALESCE(SUM(CASE WHEN t.tip = 'naplata' OR t.tip = 'oslobodjen' THEN t.broj_lezaljki ELSE 0 END), 0) as izdato
      FROM reoni r
      LEFT JOIN transakcije t ON r.id = t.reon_id 
        AND DATE(t.datum_vreme) = CURDATE()
      GROUP BY r.id
      ORDER BY r.id
    `);

    return NextResponse.json(reoni);
  } catch (error) {
    console.error('Error fetching reoni:', error);
    return NextResponse.json({ error: 'Failed to fetch reoni' }, { status: 500 });
  }
}