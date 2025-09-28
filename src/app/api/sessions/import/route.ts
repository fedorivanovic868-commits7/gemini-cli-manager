import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createSession } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionName = formData.get('sessionName') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Файл обязателен' },
        { status: 400 }
      );
    }
    
    if (!sessionName) {
      return NextResponse.json(
        { error: 'Название сессии обязательно' },
        { status: 400 }
      );
    }
    
    // Read the ZIP file
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Try to find data.txt file
    const dataFile = zip.file('data.txt');
    if (!dataFile) {
      return NextResponse.json(
        { error: 'Файл data.txt не найден в архиве' },
        { status: 400 }
      );
    }
    
    // Extract session variable from data.txt
    const dataContent = await dataFile.async('text');
    
    // Parse the content - extract the variable part (everything after the metadata)
    const lines = dataContent.split('\n');
    let variableStartIndex = -1;
    
    // Find the line where actual variable data starts (after metadata comments)
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('#') && lines[i].trim() !== '') {
        variableStartIndex = i;
        break;
      }
    }
    
    if (variableStartIndex === -1) {
      return NextResponse.json(
        { error: 'Переменная сессии не найдена в файле' },
        { status: 400 }
      );
    }
    
    // Extract the variable content
    const variable = lines.slice(variableStartIndex).join('\n').trim();
    
    if (!variable) {
      return NextResponse.json(
        { error: 'Переменная сессии пуста' },
        { status: 400 }
      );
    }
    
    // Create new session
    const newSession = await createSession(sessionName, variable);
    
    return NextResponse.json({
      success: true,
      session: newSession,
      message: 'Сессия успешно импортирована'
    });
    
  } catch (error) {
    console.error('Error importing session:', error);
    return NextResponse.json(
      { error: 'Ошибка импорта сессии. Проверьте формат файла.' },
      { status: 500 }
    );
  }
}