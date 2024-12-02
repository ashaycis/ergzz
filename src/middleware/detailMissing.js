function dataMissing(requiredFields, data) {
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (!data[field]) {
      missingFields.push(`${field} is missing`);
    }
  });

  if (missingFields.length > 0) {
    return missingFields.join(", ");
  } else {
    return null;
  }
}

module.exports = dataMissing;
