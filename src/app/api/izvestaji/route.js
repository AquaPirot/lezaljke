import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const izvestaji = await executeQuery(`
      SELECT * FROM dnevni_izvestaji
      ORDER BY datum DESC
      LIMIT 30
    `);

    // Dobij detalje reona za svaki izveštaj
    for (let izvestaj of izvestaji) {
      const reoniDetalji = await executeQuery(`
        SELECT ir.*, r.naziv
        FROM izvestaj_reoni ir
        JOIN reoni r ON ir.reon_id = r.id
        WHERE ir.izvestaj_id = ?
      `, [izvestaj.id]);
      
      izvestaj.reoni = reoniDetalji;
    }

    return NextResponse.json(izvestaji);
  } catch (error) {
    console.error('Error fetching izvestaji:', error);
    return NextResponse.json({ error: 'Failed to fetch izvestaji' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Računaj ukupan prihod za danas
    const [prihodResult] = await executeQuery(`
      SELECT COALESCE(SUM(iznos), 0) as ukupan_prihod
      FROM transakcije 
      WHERE DATE(datum_vreme) = CURDATE()
    `);

    // Računaj ukupno naplaćeno/oslobođeno
    const [statistike] = await executeQuery(`
      SELECT 
        COALESCE(SUM(CASE WHEN tip = 'naplata' THEN broj_lezaljki ELSE 0 END), 0) as ukupno_naplaceno,
        COALESCE(SUM(CASE WHEN tip = 'oslobodjen' THEN broj_lezaljki ELSE 0 END), 0) as ukupno_oslobodjeno
      FROM transakcije 
      WHERE DATE(datum_vreme) = CURDATE()
    `);

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