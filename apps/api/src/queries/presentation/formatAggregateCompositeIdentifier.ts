type AggregateCompositeIdentifier = {
    id: string;
    type: string;
};

export default ({ id, type }: AggregateCompositeIdentifier): string => `${type}/${id}`;
