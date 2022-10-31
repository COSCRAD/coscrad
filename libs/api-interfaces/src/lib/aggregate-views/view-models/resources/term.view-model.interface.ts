import { IBaseViewModel } from '../base.view-model.interface';

export interface ITermViewModel extends IBaseViewModel {
    contributor: string;

    term: string;

    termEnglish: string;

    audioUrl?: string;

    sourceProject?: string;
}
