const createSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map(field => ({ [field]: searchRegex }))
  };
};

module.exports = { createSearchQuery };