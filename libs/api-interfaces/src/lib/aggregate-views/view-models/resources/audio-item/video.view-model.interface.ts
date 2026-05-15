import { IMultilingualTextRecord } from '..';
import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { MIMEType } from '../media-items';
import { ITranscript } from './transcript.interface';

export interface IVideoViewModel extends IBaseResourceViewModel {
    name: IMultilingualTextRecord;

    videoUrl: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    transcript: ITranscript;
}
