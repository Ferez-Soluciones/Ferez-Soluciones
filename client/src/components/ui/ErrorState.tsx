/**
 * Component: ErrorState
 * Responsibility: tell the visitor a section could not load, and let them retry.
 *
 * A landing page that silently drops a section is worse than one that admits the
 * problem: the visitor sees a gap and assumes the business is careless. The
 * retry button matters because the most common cause here is transient — the API
 * restarting in development, a flaky mobile connection in production.
 *
 * `role="alert"` makes screen readers announce it as soon as it appears.
 */

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="projects__empty" role="alert">
      <p>{message}</p>
      <button className="btn btn--ghost btn--sm" type="button" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
