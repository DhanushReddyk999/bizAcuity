// Backend password validation utility
const validatePassword = (password) => {
  const errors = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  // Maximum length
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  // At least one number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*...)");
  }
  
  // No common patterns
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Password cannot contain repeated characters (e.g., 'aaa', '111')");
  }
  
  // No sequential characters
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    errors.push("Password cannot contain sequential characters (e.g., 'abc', '123')");
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

module.exports = { validatePassword }; 