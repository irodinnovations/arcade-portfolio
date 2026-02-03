'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            className="flex min-h-screen flex-col items-center justify-center bg-[#050810] text-white"
          >
            <h2 className="mb-4 font-orbitron text-2xl text-cyan-400">
              Something went wrong
            </h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded border border-cyan-400 px-6 py-2 font-rajdhani text-cyan-400 transition-colors hover:bg-cyan-400/10"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
