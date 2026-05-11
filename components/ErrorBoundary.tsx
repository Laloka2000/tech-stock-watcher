"use client";

import React from "react";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false, message: ""};
    }

    static getDerivedStateFromError(error: Error): State {
        return {hasError: true, message: error.message};
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo)
    {
        console.error("[ErrorBoundary]", error, errorInfo);
    }

    render() {
        if (this.state.hasError){
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center h-screen bg-tp-bg gap-6 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-tp-red/10 border border-tp-red/30 flex items-center justify-center text-2xl">
                        ⚠
                    </div>
                    <div className="text-center max-w-sm">
                        <h2 className="font-mono text-sm font-bold text-tp-primary mb-2">
                            Something went wrong...
                        </h2>
                        <p className="text-[11px] text-tp-muted leading-relaxed mb-1">
                            The application encountered an unexpected error.
                        </p>
                        {this.state.message && (
                            <p className="text-[10px] text-tp-red/70 font-mono mt-2 bg-tp-red/5 border border-tp-red/20 rounded-lg px-3 py-2">
                                {this.state.message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, message: "" });
                            window.location.reload();
                        }}
                        className="px-5 py-2.5 rounded-xl border border-tp-accent/40 text-tp-accent bg-tp-accent/5 hover:bg-tp-accent/10 text-xs font-mono font-bold transition-all"
                    >
                        ↻ Reload
                    </button>
                </div>
            )
        }
        return this.props.children;
    }
}