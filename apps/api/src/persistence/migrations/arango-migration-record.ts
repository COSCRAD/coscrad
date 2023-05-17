import BaseDomainModel from '../../domain/models/BaseDomainModel';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { ICoscradMigration } from './coscrad-migration.interface';
import { CoscradMigrationMetadata } from './decorators';

export class ArangoMigrationRecord extends BaseDomainModel {
    readonly sequenceNumber: number;

    readonly name: string;

    readonly metadata: CoscradMigrationMetadata;

    readonly _key: string;

    readonly dateApplied: number;

    constructor({ name, sequenceNumber }: ICoscradMigration, metadata: CoscradMigrationMetadata) {
        super();

        this._key = sequenceNumber.toString();

        this.name = name;

        this.sequenceNumber = sequenceNumber;

        this.metadata = cloneToPlainObject(metadata);

        this.dateApplied = Date.now();
    }
}
