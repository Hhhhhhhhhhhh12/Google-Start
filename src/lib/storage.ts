import type { BusinessIdea } from '../types';

const STORAGE_KEY = 'local-demand-scanner-ideas';

export function saveIdeas(ideas: BusinessIdea[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  } catch (error) {
    console.error('Failed to save ideas to localStorage:', error);
  }
}

export function loadIdeas(): BusinessIdea[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load ideas from localStorage:', error);
    return [];
  }
}

export function exportIdeasAsJson(ideas: BusinessIdea[]): void {
  const json = JSON.stringify(ideas, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `idea-scout-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function parseImportedJson(file: File): Promise<BusinessIdea[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!Array.isArray(parsed)) throw new Error('Invalid format: expected an array');
        resolve(parsed as BusinessIdea[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
