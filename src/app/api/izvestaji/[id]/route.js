import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    // Await params u Next.js 15+
    const { id } = await params;

    // Prvo obriši podatke o reonima iz izveštaja
    await executeQuery(`
      DELETE FROM izvestaj_reoni WHERE izvestaj_id = ?
    `, [id]);

    // Zatim obriši sam izveštaj
    const result = await executeQuery(`
      DELETE FROM dnevni_izvestaji WHERE id = ?
    `, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Izveštaj nije pronađen' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Izveštaj je uspešno obrisan' });
  } catch (error) {
    console.error('Error deleting izvestaj:', error);
    return NextResponse.json({ error: 'Failed to delete izvestaj' }, { status: 500 });
  }
}