export interface HasAggregateCompositeIdentifier {
    aggregateCompositeIdentifier: {
        type: string;
        id: string;
    };
}

export interface ICoscradEvent<
    TPayload extends HasAggregateCompositeIdentifier = HasAggregateCompositeIdentifier,
    UMeta extends Object = Object
> {
    // the event type, e.g. 'WIDGET_CREATED'
    type: string;

    meta: UMeta;

    payload: TPayload;
}
