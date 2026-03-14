import { useState, useCallback } from 'react';
import { sendNewsletter } from '../services/newsletterSendApi';
import { useAuthStore } from '../../auth';

interface SendNewsletterFormProps {
  html: string;
  subject: string;
  pipelineRunId?: number;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SendNewsletterForm({ html, subject, pipelineRunId }: SendNewsletterFormProps) {
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const addRecipients = useCallback((text: string) => {
    const emails = text.split(/[,\s]+/).map((e) => e.trim()).filter(Boolean);
    const valid: string[] = [];
    for (const email of emails) {
      if (!isValidEmail(email)) {
        setInputError(`잘못된 이메일: ${email}`);
        return;
      }
      if (!recipients.includes(email)) {
        valid.push(email);
      }
    }
    setInputError(null);
    setRecipients((prev) => [...prev, ...valid]);
    setInput('');
  }, [recipients]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (input.trim()) addRecipients(input);
    }
  };

  const handleBlur = () => {
    if (input.trim()) addRecipients(input);
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handleSend = useCallback(async (targetRecipients: string[]) => {
    if (targetRecipients.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      await sendNewsletter({
        html,
        subject,
        recipients: targetRecipients,
        pipelineRunId,
      });
      setResult({ type: 'success', message: `${targetRecipients.length}명에게 발송 완료` });
    } catch {
      setResult({ type: 'error', message: '발송에 실패했습니다.' });
    } finally {
      setSending(false);
    }
  }, [html, subject, pipelineRunId]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">이메일 발송</h3>

      <div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {recipients.map((email) => (
            <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
              {email}
              <button onClick={() => removeRecipient(email)} className="text-gray-400 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setInputError(null); }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="수신자 이메일 (쉼표 또는 엔터로 추가)"
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300"
        />
        {inputError && <p className="text-xs text-red-500 mt-1">{inputError}</p>}
      </div>

      <div className="flex gap-2">
        {user?.email && (
          <button
            onClick={() => handleSend([user.email])}
            disabled={sending}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '발송 중...' : '테스트 발송'}
          </button>
        )}
        <button
          onClick={() => handleSend(recipients)}
          disabled={sending || recipients.length === 0}
          className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? '발송 중...' : `전체 발송 (${recipients.length}명)`}
        </button>
      </div>

      {result && (
        <p className={`text-sm ${result.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
