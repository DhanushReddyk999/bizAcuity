// Password validation utility
export const validatePassword = (password) => {
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
    errors: errors,
    strength: calculatePasswordStrength(password)
  };
};

export const calculatePasswordStrength = (password) => {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety bonus
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Penalties
  if (/(.)\1{2,}/.test(password)) score -= 1;
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) score -= 1;
  
  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  if (score <= 6) return "strong";
  return "very-strong";
};

export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case "weak": return "#ff4444";
    case "medium": return "#ffaa00";
    case "strong": return "#44aa44";
    case "very-strong": return "#008800";
    default: return "#cccccc";
  }
};

export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case "weak": return "Weak";
    case "medium": return "Medium";
    case "strong": return "Strong";
    case "very-strong": return "Very Strong";
    default: return "Unknown";
  }
}; 