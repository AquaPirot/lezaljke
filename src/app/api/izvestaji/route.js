import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Prvo proveri da li tabela dnevni_izvestaji postoji i ima podatke
    const izvestaji = await executeQuery(`
      SELECT * FROM dnevni_izvestaji
      ORDER BY datum DESC
      LIMIT 30
    `);

    // Ako nema izveštaja, vrati prazan niz
    if (!izvestaji || izvestaji.length === 0) {
      return NextResponse.json([]);
    }

    // Dobij detalje reona za svaki izveštaj
    for (let izvestaj of izvestaji) {
      try {
        const reoniDetalji = await executeQuery(`
          SELECT ir.*, r.naziv
          FROM izvestaj_reoni ir
          JOIN reoni r ON ir.reon_id = r.id
          WHERE ir.izvestaj_id = ?
        `, [izvestaj.id]);
        
        izvestaj.reoni = reoniDetalji || [];
      } catch (err) {
        console.log('Greška pri učitavanju detalja reona:', err);
        izvestaj.reoni = [];
      }
    }

    return NextResponse.json(izvestaji);
  } catch (error) {
    console.error('Error fetching izvestaji:', error);
    // Vraćaj prazan niz umesto greške kad nema podataka
    return NextResponse.json([]);
  }
}

export async function POST() {
  try {
    // Računaj ukupan prihod za danas
    const prihodResults = await executeQuery(`
      SELECT COALESCE(SUM(iznos), 0) as ukupan_prihod
      FROM transakcije 
      WHERE DATE(datum_vreme) = CURDATE()
    `);

    // Računaj ukupno naplaćeno/oslobođeno
    const statistikeResults = await executeQuery(`
      SELECT 
        COALESCE(SUM(CASE WHEN tip = 'naplata' THEN broj_lezaljki ELSE 0 END), 0) as ukupno_naplaceno,
        COALESCE(SUM(CASE WHEN tip = 'oslobodjen' THEN broj_lezaljki ELSE 0 END), 0) as ukupno_oslobodjeno
      FROM transakcije 
      WHERE DATE(datum_vreme) = CURDATE()
    `);

    const prihodResult = prihodResults[0] || { ukupan_prihod: 0 };
    const statistike = statistikeResults[0] || { ukupno_naplaceno: 0, ukupno_oslobodjeno: 0 };

    // Kreiraj dnevni izveštaj
    const result = await executeQuery(`
      INSERT INTO dnevni_izvestaji (datum, ukupan_prihod, ukupno_naplaceno, ukupno_oslobodjeno)
      VALUES (CURDATE(), ?, ?, ?)
    `, [prihodResult.ukupan_prihod, statistike.ukupno_naplaceno, statistike.ukupno_oslobodjeno]);

    const izvestajId = result.insertId;

    // Dodaj detalje po reonima
    const reoniDetalji = await executeQuery(`
      SELECT 
        r.id as reon_id,
        COALESCE(SUM(CASE WHEN t.tip = 'naplata' THEN t.broj_lezaljki ELSE 0 END), 0) as naplaceno,
        COALESCE(SUM(CASE WHEN t.tip = 'oslobodjen' THEN t.broj_lezaljki ELSE 0 END), 0) as oslobodjeno,
        COALESCE(SUM(CASE WHEN t.tip = 'naplata' THEN t.iznos ELSE 0 END), 0) as prihod
      FROM reoni r
      LEFT JOIN transakcije t ON r.id = t.reon_id AND DATE(t.datum_vreme) = CURDATE()
      GROUP BY r.id
    `);

    for (const reon of reoniDetalji) {
      await executeQuery(`
        INSERT INTO izvestaj_reoni (izvestaj_id, reon_id, naplaceno, oslobodjeno, prihod)
        VALUES (?, ?, ?, ?, ?)
      `, [izvestajId, reon.reon_id, reon.naplaceno, reon.oslobodjeno, reon.prihod]);
    }

    return NextResponse.json({ success: true, izvestaj_id: izvestajId });
  } catch (error) {
    console.error('Error creating izvestaj:', error);
    return NextResponse.json({ error: 'Failed to create izvestaj' }, { status: 500 });
  }
}