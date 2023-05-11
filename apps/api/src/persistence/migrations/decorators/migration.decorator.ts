export type CoscradMigrationMetadata = {
    description: string;
    dateAuthored: string;
};

export const MIGRATION_METADATA = '__COSCRAD-MIGRATION__';

export function Migration(metadata: CoscradMigrationMetadata): ClassDecorator {
    return function (target: object) {
        Reflect.defineMetadata(MIGRATION_METADATA, metadata, target);
    };
}
