const bcrypt = require("bcrypt");


export const passwordHash = async (password: string, saltRounds: number): Promise<string | null> => {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (err) {
      console.log(err);
    }
    return null;
};

export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
    try {
      const matchFound = await bcrypt.compare(password, hash);
      return matchFound;
    } catch (err) {
      console.log(err);
    }
    return false;
};

