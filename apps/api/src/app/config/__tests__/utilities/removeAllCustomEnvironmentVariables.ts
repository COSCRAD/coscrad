import { buildAllCustomEnvironmentVariableKeys } from './buildAllEnvironmentVariableKeys';

/**
 * This is only a test utility.
 */
export default (): void =>
  buildAllCustomEnvironmentVariableKeys().forEach((envVar) => {
    if (process.env[envVar]) delete process.env[envVar];
  });
