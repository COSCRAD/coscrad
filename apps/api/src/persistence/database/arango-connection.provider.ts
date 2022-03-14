import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'arangojs';
import { Scheme } from '../../app/config/constants/Scheme';

// Alias for more clarity from the outside; TODO wrap `Database` with simpler API?
export type ArangoConnection = Database;

type Port = `${number}`;

const isValidPort = (input: unknown): input is Port =>
  typeof input === 'string' && !isNaN(parseInt(input));

const isPortRequired = (scheme: Scheme, port: `${number}`) => {
  if (scheme === 'http' && port === '80') return false;
  if (scheme === 'https' && port === '443') return false;
  return true;
};

const buildFullHostURL = (
  domain: string,
  scheme: Scheme = Scheme.https,
  port: Port = '443'
): string =>
  `${scheme}://${domain}${isPortRequired(scheme, port) ? `:${port}` : ''}`;

@Injectable()
export class ArangoConnectionProvider {
  #connection: ArangoConnection;

  constructor(private configService: ConfigService) {
    const dbUser = this.configService.get<string>('ARANGO_DB_USER', 'user');
    const dbPass = this.configService.get<string>(
      'ARANGO_DB_USER_PASSWORD',
      'userPASSWORD'
    );
    const dbName = this.configService.get<string>('ARANGO_DB_NAME', 'testdb');
    const dbHostDomain = this.configService.get<string>(
      'ARANGO_DB_HOST_DOMAIN',
      'localhost'
    );
    const dbHostScheme = this.configService.get<Scheme>(
      'ARANGO_DB_HOST_SCHEME',
      Scheme.http
    );

    const dbHostPort = this.configService.get<Port>(
      'ARANGO_DB_HOST_PORT',
      '80'
    );

    const systemDB = new Database({
      url: buildFullHostURL(dbHostDomain, dbHostScheme, dbHostPort),
    });
    // TODO why is `useDatabase` deprecated? can we use myDB.database("db_name")?
    const dbInstance = systemDB.database(dbName);
    dbInstance.useBasicAuth(dbUser, dbPass);

    this.#connection = dbInstance;
  }

  getConnection = (): ArangoConnection => this.#connection;
}
