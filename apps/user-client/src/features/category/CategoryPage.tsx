import { useEffect, useState, useCallback } from 'react';
import { useCategoryStore } from './stores/categoryStore';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from './services/categoryApi';
import { fetchKeywords, createKeyword, deleteKeyword, fetchFilterKeywords, createFilterKeyword, deleteFilterKeyword } from './services/keywordApi';
import { CategoryList } from './components/CategoryList';
import { CategoryForm } from './components/CategoryForm';
import { KeywordList } from './components/KeywordList';
import { FilterKeywordList } from './components/FilterKeywordList';
import { KeywordInput } from './components/KeywordInput';
import type { Category } from './services/categoryApi';

export function CategoryPage() {
  const categories = useCategoryStore((s) => s.categories);
  const selectedId = useCategoryStore((s) => s.selectedId);
  const keywords = useCategoryStore((s) => s.keywords);
  const filterKws = useCategoryStore((s) => s.filterKeywords);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'none' | 'create' | 'edit'>('none');
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await fetchCategories();
      useCategoryStore.getState().setCategories(cats);
    } catch {
      setError('카테고리를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadKeywords = useCallback(async (categoryId: number) => {
    try {
      const [kws, fkws] = await Promise.all([
        fetchKeywords(categoryId),
        fetchFilterKeywords(categoryId),
      ]);
      useCategoryStore.getState().setKeywords(kws);
      useCategoryStore.getState().setFilterKeywords(fkws);
    } catch {
      setError('키워드를 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedId) {
      loadKeywords(selectedId);
    } else {
      useCategoryStore.getState().setKeywords([]);
      useCategoryStore.getState().setFilterKeywords([]);
    }
  }, [selectedId, loadKeywords]);

  const handleCreate = async (name: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const cat = await createCategory(name);
      useCategoryStore.getState().addCategory(cat);
      setFormMode('none');
    } catch (err: any) {
      setError(err.response?.data?.message || '카테고리 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (name: string) => {
    if (!editTarget) return;
    setError(null);
    setSubmitting(true);
    try {
      const cat = await updateCategory(editTarget.id, name);
      useCategoryStore.getState().updateCategory(cat);
      setFormMode('none');
      setEditTarget(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '카테고리 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteCategory(deleteTarget.id);
      useCategoryStore.getState().removeCategory(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '카테고리 삭제에 실패했습니다.');
    }
  };

  const handleAddKeyword = async (text: string) => {
    const catId = useCategoryStore.getState().selectedId;
    if (!catId) return;
    setSubmitting(true);
    try {
      await createKeyword(catId, text);
      await loadKeywords(catId);
    } catch (err: any) {
      setError(err.response?.data?.message || '키워드 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKeyword = async (id: number) => {
    const catId = useCategoryStore.getState().selectedId;
    if (!catId) return;
    try {
      await deleteKeyword(id);
      await loadKeywords(catId);
    } catch {
      setError('키워드 삭제에 실패했습니다.');
    }
  };

  const handleAddFilterKeyword = async (text: string) => {
    const catId = useCategoryStore.getState().selectedId;
    if (!catId) return;
    setSubmitting(true);
    try {
      await createFilterKeyword(catId, text);
      await loadKeywords(catId);
    } catch (err: any) {
      setError(err.response?.data?.message || '제외 키워드 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFilterKeyword = async (id: number) => {
    const catId = useCategoryStore.getState().selectedId;
    if (!catId) return;
    try {
      await deleteFilterKeyword(id);
      await loadKeywords(catId);
    } catch {
      setError('제외 키워드 삭제에 실패했습니다.');
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">카테고리 관리</h1>
        {formMode === 'none' && (
          <button
            onClick={() => setFormMode('create')}
            className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            카테고리 추가
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {formMode !== 'none' && (
        <CategoryForm
          initialName={formMode === 'edit' ? editTarget?.name : ''}
          onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
          onCancel={() => { setFormMode('none'); setEditTarget(null); }}
          loading={submitting}
        />
      )}

      {deleteTarget && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            &ldquo;{deleteTarget.name}&rdquo; 카테고리를 삭제하시겠습니까? 하위 키워드도 함께 삭제됩니다.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">카테고리</h2>
              </div>
              <CategoryList
                onEdit={(cat) => { setEditTarget(cat); setFormMode('edit'); }}
                onDelete={(cat) => setDeleteTarget(cat)}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedCategory ? (
              <>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    키워드 — {selectedCategory.name}
                  </h2>
                  <KeywordInput placeholder="키워드 입력" onAdd={handleAddKeyword} loading={submitting} />
                  <KeywordList keywords={keywords} onDelete={handleDeleteKeyword} />
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    제외 키워드 — {selectedCategory.name}
                  </h2>
                  <KeywordInput placeholder="제외 키워드 입력" onAdd={handleAddFilterKeyword} loading={submitting} />
                  <FilterKeywordList filterKeywords={filterKws} onDelete={handleDeleteFilterKeyword} />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm">
                카테고리를 선택하면 키워드를 관리할 수 있습니다
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
