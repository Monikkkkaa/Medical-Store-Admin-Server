const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

const getPaginationData = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems: total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

module.exports = { paginate, getPaginationData };