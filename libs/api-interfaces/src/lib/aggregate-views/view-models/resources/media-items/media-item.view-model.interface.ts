import { IBaseViewModel } from '../../base.view-model.interface';
import { IContributorAndRole } from './contributor-and-role.interface';
import { MIMEType } from './mime-type.enum';

export interface IMediaItemViewModel extends IBaseViewModel {
    title?: string;

    titleEnglish?: string;

    // TODO Warn Justin about this small breaking change in the API for his language hub
    // Eventually this should be a reference to an array of Contributors (separate resource maybe?)
    contributions: IContributorAndRole[];

    url: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;
}
