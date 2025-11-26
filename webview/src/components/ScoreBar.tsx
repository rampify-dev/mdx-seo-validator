import { useValidationStore } from '../store/validationStore';

export default function ScoreBar() {
  const { score } = useValidationStore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="border border-[var(--vscode-panel-border)] rounded-lg p-4 bg-[var(--vscode-editor-background)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">SEO Score</h3>
        <span className="text-2xl font-bold">{score}/100</span>
      </div>
      <div className="space-y-1">
        <div className="h-3 bg-[var(--vscode-progressBar-background)] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getScoreColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="text-xs text-[var(--vscode-descriptionForeground)] text-right">
          {getScoreLabel(score)}
        </div>
      </div>
    </div>
  );
}
