function toUnixTimestamp(dateString) {
    // Convert the date string to a Date object
    const date = new Date(dateString);
    
    // Return the UNIX timestamp
    return Math.floor(date.getTime() / 1000);
  }
  
  // Example usage
  const unixTimestamp = toUnixTimestamp("2024-10-24 08:44:19");
  console.log(unixTimestamp); // Output: 1729759459
  