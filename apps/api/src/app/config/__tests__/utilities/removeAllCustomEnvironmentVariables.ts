import buildAllEnvironmentVariableKeys from '../../constants/buildAllEnvironmentVariableKeys';

export default (): void =>
  buildAllEnvironmentVariableKeys().forEach((envVar) => {
    if (process.env[envVar]) delete process.env[envVar];
  });
