/**
 *
 * TODO [refactor] build this from the keys of
 * `EnvironmentVariables`.
 *
 * **Note** This differs from the keys of `EnvironmentVariables`
 * in that the latter has `NODE_ENV`. Although `NODE_ENV` is
 * inherited from process.env, we still want to validate that
 * it is set to one of the allowed values and fail fast
 * if it is not.
 */
export const buildAllCustomEnvironmentVariableKeys = () => [
  'NODE_PORT',
  'ARANGO_DB_HOST_SCHEME',
  'ARANGO_DB_HOST_DOMAIN',
  'ARANGO_DB_HOST_PORT',
  'ARANGO_DB_ROOT_PASSWORD',
  'ARANGO_DB_USER',
  'ARANGO_DB_USER_PASSWORD',
  'ARANGO_DB_NAME',
  'AUTH0_ISSUER_URL',
  'AUTH0_AUDIENCE',
];
