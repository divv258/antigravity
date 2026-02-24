import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-6 text-center">
                    <div className="glass p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold glow-purple mb-4">Something went wrong</h2>
                        <div className="bg-black/30 rounded-lg p-4 mb-6 text-left overflow-auto max-h-60">
                            <p className="text-red-400 font-mono text-sm">
                                {this.state.error?.toString()}
                            </p>
                        </div>
                        <button
                            className="btn-teal w-full"
                            onClick={() => window.location.href = '/'}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
