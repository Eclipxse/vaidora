"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>Something interrupted your visit.</h1>
      <p>Please try again in a moment.</p>
      <button onClick={reset} className="button">
        Try again
      </button>
    </div>
  );
}
