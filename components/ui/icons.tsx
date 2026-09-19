interface IconProps {
    className?: string;
    size?: number;
}

export function ArrowLeftIcon({ className, size = 16 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
            <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function CloseIcon({ className, size = 14 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

export function RefreshIcon({ className, size = 15 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
            <path d="M13.2 8A5.2 5.2 0 1 1 11.6 4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M13.3 2.8v3.6h-3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function TriangleUpIcon({ className, size = 8 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
            <path d="M5 1.3l4.2 7.4H0.8z" fill="currentColor" />
        </svg>
    );
}

export function TriangleDownIcon({ className, size = 8 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
            <path d="M5 8.7L0.8 1.3h8.4z" fill="currentColor" />
        </svg>
    );
}

export function AlertIcon({ className, size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
            <path d="M8 1.6L15 14H1L8 1.6z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M8 6.2v3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="11.6" r="0.85" fill="currentColor" />
        </svg>
    );
}

export function CheckIcon({ className, size = 20 }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} aria-hidden="true">
            <path d="M3 8.5l3.5 3.5L13 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
