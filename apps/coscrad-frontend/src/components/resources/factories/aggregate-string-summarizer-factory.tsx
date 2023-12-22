import {
    AggregateType,
    IAudioItemViewModel,
    IBaseViewModel,
    IBibliographicCitationViewModel,
    IMediaItemViewModel,
} from '@coscrad/api-interfaces';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { buildBibliographicCitationJointViewModel } from '../bibliographic-citations/joint-view';

export type AggregateStringSummarizer<T extends IBaseViewModel> = (viewModel: T) => string;

export const aggregateStringSummarizerFactory = (
    aggregateType: AggregateType
    // TODO correlate the return type with aggregate type
): AggregateStringSummarizer<IBaseViewModel> => {
    if (aggregateType === AggregateType.bibliographicCitation)
        return (viewModel: IBibliographicCitationViewModel) => {
            const consolidateViewModel = buildBibliographicCitationJointViewModel(viewModel);

            return consolidateViewModel.title;
        };

    if (aggregateType === AggregateType.mediaItem)
        return ({ name }: IMediaItemViewModel): string => findOriginalTextItem(name).text;

    if (aggregateType === AggregateType.audioItem)
        return ({ name }: IAudioItemViewModel): string =>
            name.items.map(({ text, languageCode }) => `${text} (${languageCode})`).join(', ');

    // TODO Support string summarizers for other aggregate types as needed

    // Fallback to simply showing the name in the original language
    return (viewModel: IBaseViewModel) => findOriginalTextItem(viewModel.name).text;
};
