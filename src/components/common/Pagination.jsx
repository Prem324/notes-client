function Pagination({
  page,
  totalPages,
  total,
  currentCount,
  hasPrevPage,
  hasNextPage,
  loading,
  onPrevPage,
  onNextPage,
}) {
  return (
    <div>
      <div className="pagination">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!hasPrevPage || loading}
        >
          Previous
        </button>

        <span>
          Page {page || 1} of {totalPages || 1}
        </span>

        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage || loading}
        >
          Next
        </button>
      </div>

      <p className="pagination-summary">
        Showing {currentCount || 0} of {total || 0} notes
      </p>
    </div>
  );
}

export default Pagination;