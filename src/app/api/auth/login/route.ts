import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Пароль обязателен' },
        { status: 400 }
      );
    }
    
    const isValid = await verifyPassword(password);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Неверный пароль' },
        { status: 401 }
      );
    }
    
    const response = NextResponse.json({ success: true });
    setAuthCookie(response);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}