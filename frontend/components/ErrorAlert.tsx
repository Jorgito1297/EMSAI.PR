/**
 * Error alert component with retry action.
 */

import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorAlert({
  title = 'Error',
  message,
  onRetry,
}: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-red-800">{title}</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
