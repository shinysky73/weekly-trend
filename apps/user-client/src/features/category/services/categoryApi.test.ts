import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from './categoryApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('categoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldFetchCategories: GET /categories 요청하여 카테고리 목록 반환', async () => {
    const mockCategories = [
      { id: 1, name: 'AI', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockCategories });

    const result = await fetchCategories();

    expect(mockedAxios.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual(mockCategories);
  });

  it('shouldCreateCategory: POST /categories 요청', async () => {
    const mockCategory = { id: 2, name: 'Blockchain', createdAt: '2026-03-14', updatedAt: '2026-03-14' };
    mockedAxios.post.mockResolvedValue({ data: mockCategory });

    const result = await createCategory('Blockchain');

    expect(mockedAxios.post).toHaveBeenCalledWith('/categories', { name: 'Blockchain' });
    expect(result).toEqual(mockCategory);
  });

  it('shouldUpdateCategory: PATCH /categories/:id 요청', async () => {
    const mockCategory = { id: 1, name: 'AI Updated', createdAt: '2026-01-01', updatedAt: '2026-03-14' };
    mockedAxios.patch.mockResolvedValue({ data: mockCategory });

    const result = await updateCategory(1, 'AI Updated');

    expect(mockedAxios.patch).toHaveBeenCalledWith('/categories/1', { name: 'AI Updated' });
    expect(result).toEqual(mockCategory);
  });

  it('shouldDeleteCategory: DELETE /categories/:id 요청', async () => {
    mockedAxios.delete.mockResolvedValue({ status: 204 });

    await deleteCategory(1);

    expect(mockedAxios.delete).toHaveBeenCalledWith('/categories/1');
  });
});
