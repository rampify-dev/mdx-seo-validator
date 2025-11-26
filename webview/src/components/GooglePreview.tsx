import { useValidationStore } from '../store/validationStore';

export default function GooglePreview() {
  const { title, description, url, mobilePreview, toggleMobilePreview } = useValidationStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return '✓';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '';
    }
  };

  return (
    <div className="border border-[var(--vscode-panel-border)] rounded-lg p-4 bg-[var(--vscode-editor-background)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          🔍 Google Search Preview
        </h2>
        <button
          onClick={toggleMobilePreview}
          className="px-3 py-1 text-sm border border-[var(--vscode-button-border)] rounded hover:bg-[var(--vscode-button-hoverBackground)] transition-colors"
        >
          {mobilePreview ? 'Desktop' : 'Mobile'}
        </button>
      </div>

      {/* Google Search Result Mockup */}
      <div className="space-y-4">
        {/* Fake Google UI */}
        <div className="text-xs text-[var(--vscode-descriptionForeground)] pb-2 border-b border-[var(--vscode-panel-border)]">
          <div className="font-bold mb-1">google</div>
          <div className="flex gap-2 mb-2">
            <span className="border-b-2 border-blue-500 pb-1">All</span>
            <span>Images</span>
            <span>Videos</span>
            <span>News</span>
          </div>
          <div className="text-[10px]">About 1,240,000 results (0.48 seconds)</div>
        </div>

        {/* Search Result */}
        <div className="p-4 border border-[var(--vscode-panel-border)] rounded-lg bg-[var(--vscode-input-background)] space-y-2">
          {/* URL Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-[var(--vscode-descriptionForeground)]">
            <span className="text-xs">🌐</span>
            <span>{url.breadcrumb || 'example.com › blog › post'}</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <div className={`text-xl font-normal hover:underline cursor-pointer ${getStatusColor(title.status)}`}>
              {title.truncated || title.text || 'No title'}
              <span className="ml-2 text-sm">{getStatusIcon(title.status)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[var(--vscode-progressBar-background)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    title.status === 'optimal' ? 'bg-green-500'
                    : title.status === 'warning' ? 'bg-yellow-500'
                    : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((title.length / 60) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs ${getStatusColor(title.status)}`}>
                {title.length}/60
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="text-sm text-[var(--vscode-foreground)]">
              <span className="text-[var(--vscode-descriptionForeground)]">Nov 25, 2025 — </span>
              {description.truncated || description.text || 'No description'}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[var(--vscode-progressBar-background)] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    description.status === 'optimal' ? 'bg-green-500'
                    : description.status === 'warning' ? 'bg-yellow-500'
                    : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((description.length / 160) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs ${getStatusColor(description.status)}`}>
                {description.length}/160
              </span>
            </div>
          </div>
        </div>

        {/* Issues/Tips */}
        {(title.status !== 'optimal' || description.status !== 'optimal') && (
          <div className="space-y-2 text-sm">
            {title.status !== 'optimal' && (
              <div className={`flex items-start gap-2 ${getStatusColor(title.status)}`}>
                <span>{getStatusIcon(title.status)}</span>
                <span>
                  {title.status === 'warning'
                    ? 'Title length acceptable but could be optimized (aim for 50-60 chars)'
                    : title.length < 30
                    ? 'Title too short - search engines may not show enough context'
                    : 'Title too long - will be truncated in search results'}
                </span>
              </div>
            )}
            {description.status !== 'optimal' && (
              <div className={`flex items-start gap-2 ${getStatusColor(description.status)}`}>
                <span>{getStatusIcon(description.status)}</span>
                <span>
                  {description.status === 'warning'
                    ? 'Description length acceptable but could be optimized (aim for 150-160 chars)'
                    : description.length < 120
                    ? 'Description too short - add more details to entice clicks'
                    : 'Description too long - will be truncated in search results'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
