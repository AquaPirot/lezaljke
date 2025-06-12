import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const transakcije = await executeQuery(`
      SELECT t.*, r.naziv as reon_naziv
      FROM transakcije t
      JOIN reoni r ON t.reon_id = r.id
      WHERE DATE(t.datum_vreme) = CURDATE()
      ORDER BY t.datum_vreme DESC
    `);

    return NextResponse.json(transakcije);
  } catch (error) {
    console.error('Error fetching transakcije:', error);
    return NextResponse.json({ error: 'Failed to fetch transakcije' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { reon_id, broj_lezaljki, tip, opis } = await request.json();
    
    // Dobij cenu iz baze - koristi naziv kolone kako je u bazi
    const reoni = await executeQuery('SELECT cena_po_lezaljci FROM reoni WHERE id = ?', [reon_id]);
    
    if (!reoni || reoni.length === 0) {
      return NextResponse.json({ error: 'Reon nije pronađen' }, { status: 404 });
    }
    
    const reon = reoni[0];
    const iznos = tip === 'naplata' ? broj_lezaljki * reon.cena_po_lezaljci : 0;

    const result = await executeQuery(`
      INSERT INTO transakcije (reon_id, broj_lezaljki, tip, iznos, opis)
      VALUES (?, ?, ?, ?, ?)
    `, [reon_id, broj_lezaljki, tip, iznos, opis || null]);

    return NextResponse.json({ 
      success: true, 
      transakcija_id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating transakcija:', error);
    return NextResponse.json({ error: 'Failed to create transakcija' }, { status: 500 });
  }
}