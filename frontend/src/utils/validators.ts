export const validators = {
  email: (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password: string) => {
    return password.length >= 6;
  },

  required: (value: any) => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, min: number) => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number) => {
    return value.length <= max;
  },
};

export const getValidationErrors = (data: Record<string, any>) => {
  const errors: Record<string, string> = {};

  if (data.email && !validators.email(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (data.password && !validators.password(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.fullName && !validators.required(data.fullName)) {
    errors.fullName = 'Full name is required';
  }

  return errors;
};