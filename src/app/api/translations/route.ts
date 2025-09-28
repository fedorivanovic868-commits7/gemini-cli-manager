import { NextRequest, NextResponse } from 'next/server';
import { getTranslationTitles, createTranslationTitle, updateTranslationTitle, deleteTranslationTitle, initializeDatabase } from '@/lib/db';
import { analyzeTextFile } from '@/lib/file-analyzer';

export async function GET() {
  try {
    await initializeDatabase();
    const translations = await getTranslationTitles();
    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Ошибка получения переводов' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const totalChapters = parseInt(formData.get('totalChapters') as string);
    const translatedChapters = parseInt(formData.get('translatedChapters') as string);
    const status = formData.get('status') as string;
    const file = formData.get('file') as File | null;
    
    if (!title || isNaN(totalChapters) || isNaN(translatedChapters) || !status) {
      return NextResponse.json(
        { error: 'Все основные поля обязательны' },
        { status: 400 }
      );
    }
    
    let fileName: string | undefined;
    let fileCharCount: number | undefined;
    let fileWordCount: number | undefined;
    
    // Analyze file if provided
    if (file) {
      try {
        const fileContent = await file.text();
        const analysis = analyzeTextFile(fileContent);
        fileName = file.name;
        fileCharCount = analysis.charCount;
        fileWordCount = analysis.wordCount;
      } catch (error) {
        console.error('Error analyzing file:', error);
        return NextResponse.json(
          { error: 'Ошибка анализа файла' },
          { status: 400 }
        );
      }
    }
    
    await initializeDatabase();
    const translation = await createTranslationTitle(
      title,
      totalChapters,
      translatedChapters,
      status as any,
      fileName,
      fileCharCount,
      fileWordCount
    );
    
    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error creating translation:', error);
    return NextResponse.json(
      { error: 'Ошибка создания тайтла' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const totalChapters = parseInt(formData.get('totalChapters') as string);
    const translatedChapters = parseInt(formData.get('translatedChapters') as string);
    const status = formData.get('status') as string;
    const file = formData.get('file') as File | null;
    
    if (!id || !title || isNaN(totalChapters) || isNaN(translatedChapters) || !status) {
      return NextResponse.json(
        { error: 'Все основные поля обязательны' },
        { status: 400 }
      );
    }
    
    let fileName: string | undefined;
    let fileCharCount: number | undefined;
    let fileWordCount: number | undefined;
    
    // Analyze new file if provided
    if (file) {
      try {
        const fileContent = await file.text();
        const analysis = analyzeTextFile(fileContent);
        fileName = file.name;
        fileCharCount = analysis.charCount;
        fileWordCount = analysis.wordCount;
      } catch (error) {
        console.error('Error analyzing file:', error);
        return NextResponse.json(
          { error: 'Ошибка анализа файла' },
          { status: 400 }
        );
      }
    }
    
    await initializeDatabase();
    const translation = await updateTranslationTitle(
      id,
      title,
      totalChapters,
      translatedChapters,
      status as any,
      fileName,
      fileCharCount,
      fileWordCount
    );
    
    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error updating translation:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления тайтла' },
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
        { error: 'ID тайтла обязателен' },
        { status: 400 }
      );
    }
    
    await initializeDatabase();
    await deleteTranslationTitle(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting translation:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления тайтла' },
      { status: 500 }
    );
  }
}