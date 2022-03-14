/**
 * We build this newly each time to avoid shared references \ side-effects.
 */
export default () => [
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
