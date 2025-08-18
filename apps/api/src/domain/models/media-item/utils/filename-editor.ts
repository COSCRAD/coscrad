import { Request } from 'express';

export const FilenameEditor = (req: Request, file: any, callback) => {
    const newFilename = `${Date.now()}-${file.originalname}`;

    callback(null, newFilename);
};
