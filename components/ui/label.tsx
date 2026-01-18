/**
 * Label Component (Simple placeholder)
 */

interface LabelProps {
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}

export function Label({ htmlFor, children, className = '' }: LabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
        >
            {children}
        </label>
    );
}
