import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';


class ErrorBoundary extends Component<{ children: any }, { error: any }> {
  state = { error: null };
  static getDerivedStateFromError(error: any) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#fff0f8', minHeight: '100vh' }}>
          <h2 style={{ color: '#EC008C' }}>React Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#010C83', fontSize: 13 }}>
            {String((this.state.error as any)?.message || this.state.error)}
            {'\n\n'}
            {String((this.state.error as any)?.stack || '')}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
