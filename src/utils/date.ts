export const formatDateForOracle = (value: string) => {
  if (!value) return null;
  return value.split('T')[0];
};

export const formatDateForInput = (value: string) => {
  if (!value) return '';
  return value.split('T')[0];
};