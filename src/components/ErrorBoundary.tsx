import { Component, ErrorInfo, PropsWithChildren, ReactElement } from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error } as State;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-2">🚨 Application Error</h2>
            <p className="text-sm text-gray-700 mb-4">An unexpected error occurred during initialization.</p>

            <div className="bg-gray-100 rounded p-3 mb-4 overflow-auto max-h-48">
              <pre className="text-xs whitespace-pre-wrap text-red-800">{error?.toString()}
{errorInfo?.componentStack}</pre>
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.location.reload()} className="px-3 py-1 bg-red-600 text-white rounded">Reload</button>
              <button onClick={() => { navigator.clipboard?.writeText((error?.toString() || '') + '\n' + (errorInfo?.componentStack || '')); }} className="px-3 py-1 bg-gray-200 rounded">Copy details</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as ReactElement;
  }
}
