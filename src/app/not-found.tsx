import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state">
      <span className="wordmark">VAIDORA</span>
      <h1>This page has wandered.</h1>
      <p>Let’s find your way back to the fragrance collection.</p>
      <Link className="button" href="/collections">
        Explore fragrances
      </Link>
    </main>
  );
}
