export interface FileAnalysis {
  charCount: number;
  wordCount: number;
  readingTimeMinutes: number;
}

export function analyzeTextFile(content: string): FileAnalysis {
  // Count characters (excluding whitespace)
  const charCount = content.replace(/\s/g, '').length;
  
  // Count words (split by whitespace and filter empty strings)
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Calculate reading time (average reading speed: 200-250 words per minute)
  // Using 225 words per minute as average
  const readingTimeMinutes = Math.ceil(wordCount / 225);
  
  return {
    charCount,
    wordCount,
    readingTimeMinutes
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}м` : `${hours}ч`;
  }
}