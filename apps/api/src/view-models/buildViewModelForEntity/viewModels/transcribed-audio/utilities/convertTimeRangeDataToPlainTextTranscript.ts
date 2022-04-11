import { MediaTimeRange } from 'apps/api/src/domain/models/transcribed-audio/entities/MediaTimeRange';

export default (timeranges: MediaTimeRange[]): string =>
    timeranges.reduce(
        (accumulatedPlainText, { inPoint, outPoint, data }) =>
            accumulatedPlainText.concat(`\n[${inPoint}] ${data} [${outPoint}]`),
        ''
    );
