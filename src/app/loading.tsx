export default function Loading() {
  return (
    <div className="container skeleton-page" aria-label="Loading fragrances">
      <div className="skeleton" />
      <div className="product-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    </div>
  );
}
