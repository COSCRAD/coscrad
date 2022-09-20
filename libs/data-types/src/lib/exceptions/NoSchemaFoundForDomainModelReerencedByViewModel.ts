export class NoSchemaFoundForDomainModelReferencedByViewModelException extends Error {
    constructor(TargetViewModelClass: Object, propertyKey: string | symbol) {
        const msg =
            // manually box the prop as String in case it is a symbol
            `Failed to find a corresponding domain model schema definition for property: ${String(
                propertyKey
            )} of view model: ${TargetViewModelClass.constructor.name}`;

        super(msg);
    }
}
