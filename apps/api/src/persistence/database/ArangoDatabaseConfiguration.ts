import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../types/DTO';

export default class ArangoDatabaseConfiguration {
    readonly dbPass: string;

    readonly dbName: string;

    // TODO tighten this type
    readonly dbHostUrl: string;

    readonly dbRootPass: string;

    readonly dbUser: string;

    constructor({
        dbPass,
        dbName,
        dbHostUrl,
        dbRootPass,
        dbUser,
    }: DTO<ArangoDatabaseConfiguration>) {
        this.dbPass = dbPass;

        this.dbName = dbName;

        this.dbHostUrl = dbHostUrl;

        this.dbRootPass = dbRootPass;

        this.dbUser = dbUser;
    }

    public getConfig(): DTO<ArangoDatabaseConfiguration> {
        return cloneToPlainObject(this);
    }
}
