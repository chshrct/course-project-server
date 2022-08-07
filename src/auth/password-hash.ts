import bcrypt from 'bcrypt';

const HASH_SALT = 10;

export const passwordHash = (plainPassword: string): string => {
  const hash = bcrypt.hashSync(plainPassword, HASH_SALT);

  return hash;
};

export const comparePassword = (plainPassword: string, passwordHash: string): boolean => {
  const compared = bcrypt.compareSync(plainPassword, passwordHash);

  return compared;
};
