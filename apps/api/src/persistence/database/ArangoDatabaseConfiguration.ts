import { PartialDTO } from '../../types/partial-dto';

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
    }: PartialDTO<ArangoDatabaseConfiguration>) {
        this.dbPass = dbPass;

        this.dbName = dbName;

        this.dbHostUrl = dbHostUrl;

        this.dbRootPass = dbRootPass;

        this.dbUser = dbUser;
    }

    public getConfig(): PartialDTO<ArangoDatabaseConfiguration> {
        return JSON.parse(JSON.stringify(this));
    }
}
