import unidecode from "unidecode";

export const searchInDisplayedData = (data, searchTerm, searchableFields) => {
  const normalizedSearchTerm = unidecode(searchTerm.toLowerCase());
  
  return data.filter(item => {
    return searchableFields.some(field => {
      const displayValue = item[`${field}Display`] || item[field];
      if (!displayValue) return false;
      
      const normalizedValue = unidecode(String(displayValue).toLowerCase());
      return normalizedValue.includes(normalizedSearchTerm);
    });
  });
};