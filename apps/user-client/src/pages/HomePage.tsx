import { useAuthStore } from '../features/auth';
import { PipelineRunButton, PipelineStatus, PipelineHistory, StatsCards } from '../features/pipeline';

export function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            안녕하세요, {user?.name}님
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            주간동향 뉴스레터 대시보드입니다.
          </p>
        </div>
        <PipelineRunButton />
      </div>

      <PipelineStatus />
      <StatsCards />
      <PipelineHistory />
    </div>
  );
}
