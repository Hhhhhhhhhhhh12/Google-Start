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
