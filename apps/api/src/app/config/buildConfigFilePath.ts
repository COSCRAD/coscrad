import * as fs from 'fs';
import { InternalError } from '../../lib/errors/InternalError';

export default (environment: string): string => {
  const path = `${process.cwd()}/apps/api/src/app/config/${environment}.env`;

  if (!fs.existsSync(path)) {
    throw new InternalError(`Invalid .env file path: ${path}`);
  }

  console.log({
    envPath: path,
  });

  return path;
};
