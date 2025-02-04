import { AggregateType, isAggregateType, IViewUpdateNotification } from '@coscrad/api-interfaces';
import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header/header';
import { getConfig } from '../config';
import { ConfigurableContentContext } from '../configurable-front-matter/configurable-content-provider';
import { fetchFreshState } from '../store/slices/utils/fetch-fresh-state';
import { CoscradLayoutContainer } from './coscrad-layout-container';
import { useAppDispatch } from './hooks';

const isViewWriteEvent = (input: unknown): input is IViewUpdateNotification['data'] =>
    !isNullOrUndefined(input) && isNonEmptyString((input as IViewUpdateNotification['data']).type);

const subscribeToRealTimeUpdates = (dispatch: ReturnType<typeof useAppDispatch>) => {
    const eventSource = new EventSource(`${getConfig().apiUrl}/commands/notifications`);

    eventSource.onmessage = (result) => {
        /**
         * TODO Move the following somewhere else. `store`?
         *
         */
        const message = JSON.parse(result?.data);

        const aggregateTypeFromMessage = message.aggregateCompositeIdentifier?.type;

        // TODO update this
        const eventSourcedAggregateTypes = [
            AggregateType.term,
            AggregateType.vocabularyList,
        ] as AggregateType[];

        if (
            isAggregateType(aggregateTypeFromMessage) &&
            !eventSourcedAggregateTypes.includes(aggregateTypeFromMessage)
        )
            fetchFreshState(dispatch, aggregateTypeFromMessage);
    };

    const viewWriteEventSource = new EventSource(
        `${getConfig().apiUrl}/notifications/resourceUpdates`
    );

    viewWriteEventSource.onmessage = (result) => {
        const event = JSON.parse(result.data);

        console.log({ sse: event });

        /**
         * Note that we should only fetch a single view, not all views
         * here. This is inefficient.
         *
         * However, note that we don't really want to send `aggregate IDs` over
         * the wire on a public channel. We may want to use a web sockets
         * implementation or a different paradigm (e.g., htmx) in the future.
         */
        if (isViewWriteEvent(event)) {
            console.log('fetching freshhhhhhh');
            const { type } = event;

            // TODO Map the view collection names to aggregate types in the repository layer
            if (type === 'term__VIEWS') {
                fetchFreshState(dispatch, AggregateType.term);
            }

            if (type === 'vocabularyList__VIEWS') {
                fetchFreshState(dispatch, AggregateType.vocabularyList);
            }
        }
    };
};

export function App() {
    const dispatch = useAppDispatch();

    // const token = useSelector(selectAuthToken);

    /**
     * While it is possible to stream updates to non-admin users, there are far more
     * non-admin useres than admin-users and it's not important to non-admin users to
     * see the rare real-time updates. On the other hand, it's crucial that admin-users
     * see updates in real time.
     *
     * Note that in the future, we may want to move to a web-sockets implementation.
     */
    // if (isNonEmptyString(token)) {
    subscribeToRealTimeUpdates(dispatch);
    // }

    const { siteTitle, siteFavicon } = useContext(ConfigurableContentContext);

    useEffect(() => {
        document.title = siteTitle;
    }, [siteTitle]);

    const link: HTMLLinkElement =
        document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = siteFavicon;
    document.getElementsByTagName('head')[0].appendChild(link);

    return (
        <>
            <Header />
            <CoscradLayoutContainer>
                <Outlet />
            </CoscradLayoutContainer>
            <Footer />
        </>
    );
}

export default App;
