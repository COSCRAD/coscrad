import { AggregateType } from '../../aggregate-type.enum';
import { IMultilingualText } from '../common';

export interface IMediaSegmentLabel {
    inPointSeconds: number;
    outPointSeconds: number;
    name: string;
    note: IMultilingualText;
    // In this context, we only care about the current tag label not the tag's ID
    tags: string[];
}

export interface IMediaAnnotation {
    aggregateCompositeIdentifier: {
        type: typeof AggregateType.audioItem | typeof AggregateType.video;
        id: string;
    };
    labels: IMediaSegmentLabel[];
}
