export interface ICompositeIdentifier<
    T extends string = string,
    UAggregateIdType extends string | number = string
> {
    type: T;
    id: UAggregateIdType;
}
