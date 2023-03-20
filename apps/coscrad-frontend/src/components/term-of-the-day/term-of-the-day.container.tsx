import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { useLoadableTermById } from '../../store/slices/resources';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { TermOfTheDayPresenter } from './term-of-the-day.presenter';
import { useDate } from './use-date';

export const TermOfTheDayContainer = (): JSX.Element => {
    const { termOfTheDayConfig } = useContext(ConfigurableContentContext);

    const monthAndDate = useDate();

    const termOfTheDayId = termOfTheDayConfig[monthAndDate.date.toString()];

    const loadableTermSearchResult = useLoadableTermById(termOfTheDayId);

    const Presenter = displayLoadableSearchResult(
        TermOfTheDayPresenter,
        (loadableTermSearchResult) => ({
            termProps: loadableTermSearchResult,
            monthAndDate,
        })
    );

    return <Presenter {...loadableTermSearchResult} />;
};
