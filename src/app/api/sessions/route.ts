import { NextRequest, NextResponse } from 'next/server';
import { getSessions, createSession, updateSession, deleteSession, updateSessionStatus, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Ошибка получения сессий' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, variable } = await request.json();
    
    if (!name || !variable) {
      return NextResponse.json(
        { error: 'Название и переменная обязательны' },
        { status: 400 }
      );
    }
    
    await initializeDatabase();
    const session = await createSession(name, variable);
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Ошибка создания сессии' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, variable, status } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID сессии обязателен' },
        { status: 400 }
      );
    }
    
    await initializeDatabase();
    
    if (status && !name && !variable) {
      // Only updating status
      const session = await updateSessionStatus(id, status);
      return NextResponse.json(session);
    } else {
      // Full update
      if (!name || !variable || !status) {
        return NextResponse.json(
          { error: 'Все поля обязательны для полного обновления' },
          { status: 400 }
        );
      }
      const session = await updateSession(id, name, variable, status);
      return NextResponse.json(session);
    }
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления сессии' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID сессии обязателен' },
        { status: 400 }
      );
    }
    
    await initializeDatabase();
    await deleteSession(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления сессии' },
      { status: 500 }
    );
  }
}