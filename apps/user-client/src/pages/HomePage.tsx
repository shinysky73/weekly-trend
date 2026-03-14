import { useAuthStore } from '../features/auth';
import { PipelinePanel, PipelineHistory } from '../features/pipeline';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          안녕하세요, {user?.name}님
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          주간동향 뉴스레터 대시보드입니다.{' '}
          <Link to="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">카테고리/키워드 관리</Link>
          에서 수집 키워드를 설정하고, 파이프라인을 실행하세요.
        </p>
      </div>

      <PipelinePanel />
      <PipelineHistory />
    </div>
  );
}
