import { useNewsStore } from '../features/news';
import { NewsPage } from '../features/news';
import { PipelinePanel, PipelineHistory } from '../features/pipeline';

export function HomePage() {
  const refresh = useNewsStore((s) => s.refresh);

  return (
    <div className="space-y-6">
      <PipelinePanel onComplete={refresh} />
      <NewsPage />
      <PipelineHistory />
    </div>
  );
}
