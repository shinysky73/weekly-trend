import axios from 'axios';

export interface Keyword {
  id: number;
  text: string;
  categoryId: number;
  createdAt: string;
}

export interface FilterKeyword {
  id: number;
  text: string;
  categoryId: number;
  createdAt: string;
}

export async function fetchKeywords(categoryId: number): Promise<Keyword[]> {
  const response = await axios.get<Keyword[]>(`/categories/${categoryId}/keywords`);
  return response.data;
}

export async function createKeyword(categoryId: number, text: string): Promise<Keyword> {
  const response = await axios.post<Keyword>(`/categories/${categoryId}/keywords`, { text });
  return response.data;
}

export async function deleteKeyword(id: number): Promise<void> {
  await axios.delete(`/keywords/${id}`);
}

export async function fetchFilterKeywords(categoryId: number): Promise<FilterKeyword[]> {
  const response = await axios.get<FilterKeyword[]>(`/categories/${categoryId}/filter-keywords`);
  return response.data;
}

export async function createFilterKeyword(categoryId: number, text: string): Promise<FilterKeyword> {
  const response = await axios.post<FilterKeyword>(`/categories/${categoryId}/filter-keywords`, { text });
  return response.data;
}

export async function deleteFilterKeyword(id: number): Promise<void> {
  await axios.delete(`/filter-keywords/${id}`);
}
