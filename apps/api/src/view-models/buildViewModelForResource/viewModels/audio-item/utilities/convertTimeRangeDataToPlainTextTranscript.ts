import { TranscriptItem } from '../../../../../domain/models/audio-item/entities/MediaTimeRange';

export default (timeranges: TranscriptItem[]): string =>
    timeranges.reduce(
        (accumulatedPlainText, { inPoint, outPoint, text: data }) =>
            accumulatedPlainText.concat(`\n[${inPoint}] ${data} [${outPoint}]`),
        ''
    );
