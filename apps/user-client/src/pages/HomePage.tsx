import { useAuthStore } from '../features/auth';

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          안녕하세요, {user?.name}님
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {'weekly-trend'}에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-1">시작하기</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            새로운 기능을 여기에 추가하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
