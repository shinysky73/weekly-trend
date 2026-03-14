import { PipelinePanel, PipelineHistory } from '../features/pipeline';

export function HomePage() {
  return (
    <div className="space-y-6">
      <PipelinePanel />
      <PipelineHistory />
    </div>
  );
}
