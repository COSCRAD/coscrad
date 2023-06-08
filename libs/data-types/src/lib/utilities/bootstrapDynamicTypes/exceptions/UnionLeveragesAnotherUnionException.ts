export class UnionLeveragesAnotherException extends Error {
    constructor(unionName: string) {
        const msg = [
            `Failed to compile union types for union: ${unionName}`,
            `as we do not currently support union types whose members leverage union types`,
        ].join(' ');

        super(msg);
    }
}
