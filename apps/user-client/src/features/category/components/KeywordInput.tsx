import { useState } from 'react';

interface KeywordInputProps {
  placeholder: string;
  onAdd: (text: string) => void;
  loading?: boolean;
}

export function KeywordInput({ placeholder, onAdd, loading }: KeywordInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent transition-shadow"
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        추가
      </button>
    </form>
  );
}
