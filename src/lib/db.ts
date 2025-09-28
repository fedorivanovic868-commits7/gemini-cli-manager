import { prisma } from './prisma'

export interface Session {
  id: number;
  name: string;
  variable: string;
  status: 'Свободно' | 'Используется' | 'Истекла квота';
  createdAt: Date;
}

export interface TranslationTitle {
  id: number;
  title: string;
  status: 'Нужен перевод' | 'В переводе' | 'Переведено';
  totalChapters: number;
  translatedChapters: number;
  fileName?: string | null;
  fileCharCount?: number | null;
  fileWordCount?: number | null;
  createdAt: Date;
}

// Session CRUD operations
export async function getSessions(): Promise<Session[]> {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return sessions.map((session: {
      id: number;
      name: string;
      variable: string;
      status: string;
      createdAt: Date;
    }) => ({
      ...session,
      status: session.status as Session['status']
    }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
}

export async function createSession(name: string, variable: string): Promise<Session> {
  try {
    const session = await prisma.session.create({
      data: {
        name,
        variable,
      }
    });
    return {
      ...session,
      status: session.status as Session['status']
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function updateSession(id: number, name: string, variable: string, status: Session['status']): Promise<Session> {
  try {
    const session = await prisma.session.update({
      where: { id },
      data: {
        name,
        variable,
        status
      }
    });
    return {
      ...session,
      status: session.status as Session['status']
    };
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

export async function updateSessionStatus(id: number, status: Session['status']): Promise<Session> {
  try {
    const session = await prisma.session.update({
      where: { id },
      data: { status }
    });
    return {
      ...session,
      status: session.status as Session['status']
    };
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
}

export async function deleteSession(id: number): Promise<void> {
  try {
    await prisma.session.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export async function resetExpiredQuotaSessions(): Promise<void> {
  try {
    await prisma.session.updateMany({
      where: {
        status: 'Истекла квота'
      },
      data: {
        status: 'Свободно'
      }
    });
  } catch (error) {
    console.error('Error resetting expired quota sessions:', error);
    throw error;
  }
}

// Translation CRUD operations
export async function getTranslationTitles(): Promise<TranslationTitle[]> {
  try {
    const translations = await prisma.translationTitle.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return translations.map((translation: {
      id: number;
      title: string;
      status: string;
      totalChapters: number;
      translatedChapters: number;
      fileName?: string | null;
      fileCharCount?: number | null;
      fileWordCount?: number | null;
      createdAt: Date;
    }) => ({
      ...translation,
      status: translation.status as TranslationTitle['status']
    }));
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
    const translation = await prisma.translationTitle.create({
      data: {
        title,
        totalChapters,
        translatedChapters,
        status,
        fileName,
        fileCharCount,
        fileWordCount
      }
    });
    return {
      ...translation,
      status: translation.status as TranslationTitle['status']
    };
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
    const translation = await prisma.translationTitle.update({
      where: { id },
      data: {
        title,
        totalChapters,
        translatedChapters,
        status,
        fileName,
        fileCharCount,
        fileWordCount
      }
    });
    return {
      ...translation,
      status: translation.status as TranslationTitle['status']
    };
  } catch (error) {
    console.error('Error updating translation title:', error);
    throw error;
  }
}

export async function deleteTranslationTitle(id: number): Promise<void> {
  try {
    await prisma.translationTitle.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting translation title:', error);
    throw error;
  }
}