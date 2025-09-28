import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getSessions } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID сессии обязателен' },
        { status: 400 }
      );
    }
    
    // Get sessions from database
    const sessions = await getSessions();
    const session = sessions.find(s => s.id === parseInt(sessionId));
    
    if (!session) {
      return NextResponse.json(
        { error: 'Сессия не найдена' },
        { status: 404 }
      );
    }
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Add session data as data.txt
    const sessionData = `# Gemini CLI Session Data
# Session Name: ${session.name}
# Created: ${session.created_at}
# Status: ${session.status}

${session.variable}`;
    
    zip.file('data.txt', sessionData);
    
    // Add metadata file
    const metadata = {
      name: session.name,
      status: session.status,
      created_at: session.created_at,
      exported_at: new Date().toISOString(),
    };
    
    zip.file('session-metadata.json', JSON.stringify(metadata, null, 2));
    
    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'blob' });
    
    // Create response with ZIP file
    const response = new NextResponse(zipBuffer);
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', `attachment; filename="${session.name.replace(/[^a-zA-Z0-9]/g, '_')}_session.zip"`);
    
    return response;
  } catch (error) {
    console.error('Error exporting session:', error);
    return NextResponse.json(
      { error: 'Ошибка экспорта сессии' },
      { status: 500 }
    );
  }
}