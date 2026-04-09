// next-frontend/lib/utils/passwordStrength.ts

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  requirements: {
    length: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export const evaluatePasswordStrength = (password: string): PasswordStrengthResult => {
  const result: PasswordStrengthResult = {
    score: 0,
    label: 'Very Weak',
    requirements: {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    },
  };

  if (result.requirements.length) result.score += 1;
  if (result.requirements.uppercase) result.score += 1;
  if (result.requirements.number) result.score += 1;
  if (result.requirements.special) result.score += 1;

  switch (result.score) {
    case 0:
    case 1:
      result.label = 'Very Weak';
      break;
    case 2:
      result.label = 'Weak';
      break;
    case 3:
      result.label = 'Medium';
      break;
    case 4:
      result.label = 'Strong';
      break;
    default:
      result.label = 'Very Strong';
  }

  return result;
};
