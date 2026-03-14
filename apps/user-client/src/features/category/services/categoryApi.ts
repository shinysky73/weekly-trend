import axios from 'axios';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await axios.get<Category[]>('/categories');
  return response.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await axios.post<Category>('/categories', { name });
  return response.data;
}

export async function updateCategory(id: number, name: string): Promise<Category> {
  const response = await axios.patch<Category>(`/categories/${id}`, { name });
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await axios.delete(`/categories/${id}`);
}
