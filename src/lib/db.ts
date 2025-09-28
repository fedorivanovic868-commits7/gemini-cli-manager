import { sql } from '@vercel/postgres';

export interface Session {
  id: number;
  name: string;
  variable: string;
  status: 'Свободно' | 'Используется' | 'Истекла квота';
  created_at: string;
}

export interface TranslationTitle {
  id: number;
  title: string;
  status: 'Нужен перевод' | 'В переводе' | 'Переведено';
  total_chapters: number;
  translated_chapters: number;
  file_name?: string;
  file_char_count?: number;
  file_word_count?: number;
  created_at: string;
}

export async function initializeDatabase() {
  try {
    // Create Sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        variable TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Свободно' CHECK (status IN ('Свободно', 'Используется', 'Истекла квота')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create TranslationTitles table
    await sql`
      CREATE TABLE IF NOT EXISTS translation_titles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Нужен перевод' CHECK (status IN ('Нужен перевод', 'В переводе', 'Переведено')),
        total_chapters INTEGER NOT NULL DEFAULT 0,
        translated_chapters INTEGER NOT NULL DEFAULT 0,
        file_name TEXT,
        file_char_count INTEGER,
        file_word_count INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Session CRUD operations
export async function getSessions(): Promise<Session[]> {
  try {
    const { rows } = await sql`SELECT * FROM sessions ORDER BY created_at DESC`;
    return rows as Session[];
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
}

export async function createSession(name: string, variable: string): Promise<Session> {
  try {
    const { rows } = await sql`
      INSERT INTO sessions (name, variable)
      VALUES (${name}, ${variable})
      RETURNING *
    `;
    return rows[0] as Session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function updateSession(id: number, name: string, variable: string, status: Session['status']): Promise<Session> {
  try {
    const { rows } = await sql`
      UPDATE sessions 
      SET name = ${name}, variable = ${variable}, status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] as Session;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

export async function updateSessionStatus(id: number, status: Session['status']): Promise<Session> {
  try {
    const { rows } = await sql`
      UPDATE sessions 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] as Session;
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
}

export async function deleteSession(id: number): Promise<void> {
  try {
    await sql`DELETE FROM sessions WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export async function resetExpiredQuotaSessions(): Promise<void> {
  try {
    await sql`
      UPDATE sessions 
      SET status = 'Свободно' 
      WHERE status = 'Истекла квота'
    `;
  } catch (error) {
    console.error('Error resetting expired quota sessions:', error);
    throw error;
  }
}

// Translation CRUD operations
export async function getTranslationTitles(): Promise<TranslationTitle[]> {
  try {
    const { rows } = await sql`SELECT * FROM translation_titles ORDER BY created_at DESC`;
    return rows as TranslationTitle[];
  } catch (error) {
    console.error('Error fetching translation titles:', error);
    throw error;
  }
}

export async function createTranslationTitle(
  title: string,
  totalChapters: number,
  translatedChapters: number,
  status: TranslationTitle['status'],
  fileName?: string,
  fileCharCount?: number,
  fileWordCount?: number
): Promise<TranslationTitle> {
  try {
    const { rows } = await sql`
      INSERT INTO translation_titles (
        title, total_chapters, translated_chapters, status,
        file_name, file_char_count, file_word_count
      )
      VALUES (
        ${title}, ${totalChapters}, ${translatedChapters}, ${status},
        ${fileName || null}, ${fileCharCount || null}, ${fileWordCount || null}
      )
      RETURNING *
    `;
    return rows[0] as TranslationTitle;
  } catch (error) {
    console.error('Error creating translation title:', error);
    throw error;
  }
}

export async function updateTranslationTitle(
  id: number,
  title: string,
  totalChapters: number,
  translatedChapters: number,
  status: TranslationTitle['status'],
  fileName?: string,
  fileCharCount?: number,
  fileWordCount?: number
): Promise<TranslationTitle> {
  try {
    const { rows } = await sql`
      UPDATE translation_titles 
      SET title = ${title}, 
          total_chapters = ${totalChapters}, 
          translated_chapters = ${translatedChapters}, 
          status = ${status},
          file_name = ${fileName || null},
          file_char_count = ${fileCharCount || null},
          file_word_count = ${fileWordCount || null}
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] as TranslationTitle;
  } catch (error) {
    console.error('Error updating translation title:', error);
    throw error;
  }
}

export async function deleteTranslationTitle(id: number): Promise<void> {
  try {
    await sql`DELETE FROM translation_titles WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting translation title:', error);
    throw error;
  }
}