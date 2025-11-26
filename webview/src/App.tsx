import { useEffect } from 'react';
import { useValidationStore } from './store/validationStore';
import GooglePreview from './components/GooglePreview';
import ValidationPanel from './components/ValidationPanel';
import ScoreBar from './components/ScoreBar';

// VS Code API
declare const acquireVsCodeApi: () => any;
const vscode = acquireVsCodeApi();

function App() {
  const { updateValidation } = useValidationStore();

  useEffect(() => {
    // Listen for messages from extension
    const messageListener = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case 'validation-update':
          updateValidation(message.data);
          break;
      }
    };

    window.addEventListener('message', messageListener);

    // Tell extension we're ready
    vscode.postMessage({ type: 'ready' });

    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [updateValidation]);

  return (
    <div className="p-4 space-y-4">
      <GooglePreview />
      <ScoreBar />
      <ValidationPanel />
    </div>
  );
}

export default App;
