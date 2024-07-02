import * as bcrypt from 'bcrypt';

export const hash = async (args: string) => {
    return await bcrypt.hash(args, 10);
};

export const compare = async (args: string, hash: string) => {
    return await bcrypt.compare(args, hash);
};
