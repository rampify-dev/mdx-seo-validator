import { useValidationStore } from '../store/validationStore';

declare const acquireVsCodeApi: () => any;
const vscode = acquireVsCodeApi();

export default function ValidationPanel() {
  const { categories, expandedCategories, toggleCategory } = useValidationStore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <span className="text-green-500">✓</span>;
      case 'warning': return <span className="text-yellow-500">⚠️</span>;
      case 'error': return <span className="text-red-500">❌</span>;
      case 'info': return <span className="text-blue-500">ℹ️</span>;
      default: return null;
    }
  };

  const getCategoryIcon = (score: number) => {
    if (score === 100) return '✓';
    if (score >= 75) return '⚠️';
    return '❌';
  };

  const jumpToLine = (line?: number) => {
    if (line !== undefined) {
      vscode.postMessage({ type: 'jump-to-line', line });
    }
  };

  const applyFix = (ruleId: string, line?: number) => {
    vscode.postMessage({ type: 'apply-fix', ruleId, line });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-2">Validation Rules</h3>

      {categories.map((category) => {
        const isExpanded = expandedCategories.includes(category.id);

        return (
          <div
            key={category.id}
            className="border border-[var(--vscode-panel-border)] rounded-lg overflow-hidden bg-[var(--vscode-editor-background)]"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--vscode-list-hoverBackground)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm">{isExpanded ? '▼' : '►'}</span>
                <span className="font-medium">
                  {getCategoryIcon(category.score)} {category.name}
                </span>
                <span className="text-sm text-[var(--vscode-descriptionForeground)]">
                  ({category.passing}/{category.total} passing)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 w-24 h-2 bg-[var(--vscode-progressBar-background)] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      category.score === 100 ? 'bg-green-500'
                      : category.score >= 75 ? 'bg-yellow-500'
                      : 'bg-red-500'
                    }`}
                    style={{ width: `${category.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{category.score}%</span>
              </div>
            </button>

            {/* Category Rules */}
            {isExpanded && (
              <div className="border-t border-[var(--vscode-panel-border)] divide-y divide-[var(--vscode-panel-border)]">
                {category.rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="px-4 py-3 hover:bg-[var(--vscode-list-hoverBackground)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(rule.status)}
                          <span className="font-medium text-sm">{rule.name}</span>
                          {rule.value && (
                            <span className="text-xs text-[var(--vscode-descriptionForeground)]">
                              {rule.value}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--vscode-descriptionForeground)] pl-6">
                          {rule.message}
                        </div>
                        {rule.line !== undefined && (
                          <button
                            onClick={() => jumpToLine(rule.line)}
                            className="text-xs text-blue-500 hover:underline pl-6"
                          >
                            → Line {rule.line}
                          </button>
                        )}
                      </div>
                      {rule.canFix && rule.status !== 'pass' && (
                        <button
                          onClick={() => applyFix(rule.id, rule.line)}
                          className="px-2 py-1 text-xs border border-[var(--vscode-button-border)] rounded hover:bg-[var(--vscode-button-hoverBackground)] transition-colors"
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
