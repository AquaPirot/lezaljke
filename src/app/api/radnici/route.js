// src/app/api/radnici/route.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT id, ime, pozicija FROM radnici WHERE aktivan = TRUE ORDER BY ime'
    );
    
    return Response.json(rows);
    
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Greška pri učitavanju radnika' }, 
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request) {
  let connection;
  
  try {
    const { ime, pozicija = 'Konobar' } = await request.json();
    
    if (!ime || ime.trim().length < 2) {
      return Response.json(
        { error: 'Ime mora biti najmanje 2 karaktera' }, 
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'INSERT INTO radnici (ime, pozicija) VALUES (?, ?)',
      [ime.trim(), pozicija]
    );
    
    return Response.json({
      id: result.insertId,
      ime: ime.trim(),
      pozicija,
      message: 'Radnik je uspešno dodat'
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Greška pri dodavanju radnika' }, 
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}