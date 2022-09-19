export class NoDiscriminantRegisteredForUnionModelException extends Error {
    constructor(UnionMemberClass: Object) {
        super(
            `No discriminant value has been registered for union member: ${UnionMemberClass.constructor.name}`
        );
    }
}
