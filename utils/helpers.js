// Helper functions for Fennec FC CMS

// Turns a string into a URL-friendly slug (lowercase, hyphens, no special chars)
exports.slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove non-word characters
    .replace(/\-\-+/g, '-')         // Collapse multiple hyphens
    .replace(/^-+/, '')             // Remove hyphens from start
    .replace(/-+$/, '');            // Remove hyphens from end
};

// Formats a date into a readable string, with different styles
exports.formatDate = (date, format = 'full') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (format === 'short') {
    // Example: 31/12/2024
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } else if (format === 'time') {
    // Example: 14:05
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  } else if (format === 'datetime') {
    // Example: 31/12/2024 14:05
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  } else {
    // Example: Tuesday, 31 December 2024
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
};

// Tells you how long ago a date was (e.g. "2 days ago")
exports.timeAgo = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  let interval = Math.floor(seconds / 31536000); // years
  if (interval >= 1) return interval === 1 ? '1 year ago' : `${interval} years ago`;

  interval = Math.floor(seconds / 2592000); // months
  if (interval >= 1) return interval === 1 ? '1 month ago' : `${interval} months ago`;

  interval = Math.floor(seconds / 86400); // days
  if (interval >= 1) return interval === 1 ? '1 day ago' : `${interval} days ago`;

  interval = Math.floor(seconds / 3600); // hours
  if (interval >= 1) return interval === 1 ? '1 hour ago' : `${interval} hours ago`;

  interval = Math.floor(seconds / 60); // minutes
  if (interval >= 1) return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;

  return 'Just now';
};

// Shortens a string and adds "..." if it's too long
exports.truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Removes dangerous HTML to help prevent XSS attacks
exports.sanitizeHtml = (html) => {
  if (!html) return '';
  // Remove <script> tags, inline event handlers, and dangerous protocols
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
};

// Makes a random string of letters and numbers
exports.generateRandomString = (length = 20) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Checks if an email address looks valid
exports.isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

// Checks if a string is a valid URL
exports.isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Formats a number as a price, with a currency symbol
exports.formatPrice = (price, currency = '£') => {
  if (isNaN(price)) return '';
  return `${currency}${parseFloat(price).toFixed(2)}`;
};

// Capitalizes the first letter of every word in a string
exports.capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Turns a query string like "?a=1&b=2" into an object { a: "1", b: "2" }
exports.parseQueryString = (queryString) => {
  if (!queryString || queryString === '?') return {};
  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
};

// Checks if a user has a required role (or one of several roles)
exports.hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false;
  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return required.includes(userRole);
};

// Converts a file size in bytes to something like "2.5 MB"
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

// Gets the file extension from a filename (e.g. "jpg" from "photo.jpg")
exports.getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

// Checks if a file is an image based on its extension
exports.isImageFile = (filename) => {
  if (!filename) return false;
  const ext = exports.getFileExtension(filename);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  return imageExtensions.includes(ext);
};

// Builds an array of pagination links for a paged list
exports.generatePagination = (current, total, display = 5) => {
  if (total <= 1) return [];

  const pages = [];

  // If there aren't many pages, just show them all
  if (total <= display) {
    for (let i = 1; i <= total; i++) {
      pages.push({
        page: i,
        active: i === current
      });
    }
    return pages;
  }

  // Always show the first page
  pages.push({
    page: 1,
    active: current === 1
  });

  // Figure out which pages to show in the middle
  let start = Math.max(2, current - Math.floor((display - 2) / 2));
  let end = Math.min(total - 1, start + display - 3);

  if (start === 2) {
    end = Math.min(total - 1, display - 1);
  }
  if (end === total - 1) {
    start = Math.max(2, total - display + 2);
  }

  // Add "..." if there's a gap after the first page
  if (start > 2) {
    pages.push({ page: '...', active: false });
  }

  // Add the middle page numbers
  for (let i = start; i <= end; i++) {
    pages.push({
      page: i,
      active: i === current
    });
  }

  // Add "..." if there's a gap before the last page
  if (end < total - 1) {
    pages.push({ page: '...', active: false });
  }

  // Always show the last page
  pages.push({
    page: total,
    active: current === total
  });

  return pages;
};

// Calculates how many pages you need for a list, given the total items and page size
exports.calculateTotalPages = (count, pageSize) => {
  return Math.ceil(count / pageSize);
};

// Checks if an object has no properties
exports.isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

// Makes a deep copy of an object or array (so changes don't affect the original)
exports.deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (Array.isArray(obj)) {
    return obj.map(item => exports.deepClone(item));
  }
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = exports.deepClone(obj[key]);
    }
  }
  return cloned;
};

// Gives you a random whole number between min and max (inclusive)
exports.randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
