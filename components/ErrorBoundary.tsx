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
                <div className="flex flex-col items-center justify-center h-screen bg-tp-paper gap-6 p-8">
                    <div className="w-14 h-14 rounded-sm bg-tp-rust/10 border border-tp-rust/30 flex items-center justify-center text-2xl">
                        ⚠
                    </div>
                    <div className="text-center max-w-sm">
                        <h2 className="font-serif text-lg font-semibold text-tp-ink mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-[13px] text-tp-ink2 leading-relaxed mb-1">
                            The application ran into an unexpected error.
                        </p>
                        {this.state.message && (
                            <p className="text-[11px] text-tp-rust/80 font-mono mt-2 bg-tp-rust/[0.05] border border-tp-rust/20 rounded-sm px-3 py-2">
                                {this.state.message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, message: "" });
                            window.location.reload();
                        }}
                        className="px-5 py-2.5 rounded-sm border border-tp-teal/40 text-tp-teal bg-tp-teal/5 hover:bg-tp-teal/10 text-xs font-mono font-semibold transition-all"
                    >
                        ↻ Reload
                    </button>
                </div>
            )
        }
        return this.props.children;
    }
}