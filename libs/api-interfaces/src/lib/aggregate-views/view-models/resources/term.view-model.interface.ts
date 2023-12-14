import { IBaseViewModel } from '../base.view-model.interface';

export interface ITermViewModel extends IBaseViewModel {
    // the term text comes through on the `name` property for now
    contributor: string;

    audioURL?: string;

    sourceProject?: string;
}
