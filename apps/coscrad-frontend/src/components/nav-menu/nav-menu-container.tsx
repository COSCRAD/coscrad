import { CategorizableType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { useContext } from 'react';
import { routes } from '../../app/routes/routes';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { NavMenuPresenter } from './nav-menu-presenter';

export type NavItemInfo = {
    link: string;
    label: string;
};

export const NavMenuContainer = (): JSX.Element => {
    const { indexToDetailFlows, listenLive } = useContext(ConfigurableContentContext);
    // TODO: We should have a NavBar container and presenter

    // note this may be [] if we haven't included `notes`
    const dynamicLinks = indexToDetailFlows
        .filter(({ categorizableType }) => categorizableType === CategorizableType.note)
        .map(({ label, route }) => ({
            link: route || routes.notes.index,
            label: label || 'Notes',
        }))
        .concat([
            ...(isNullOrUndefined(listenLive)
                ? []
                : [
                      {
                          link: routes.listenLive,
                          label: listenLive.playingMessage,
                      },
                  ]),
        ]);

    // We may want an enum \ constants for our routes
    const navItemInfos: NavItemInfo[] = [
        {
            link: routes.home,
            label: 'Home',
        },
        {
            link: routes.about,
            label: 'About',
        },
        {
            link: routes.resources.info,
            label: 'Browse Resources',
        },
        {
            link: routes.tags.index,
            label: 'Tags',
        },
        {
            link: routes.treeOfKnowledge,
            label: 'Tree of Knowledge',
        },
        ...dynamicLinks,
        {
            link: routes.siteCredits,
            label: 'Credits',
        },
    ];

    return <NavMenuPresenter navItemInfos={navItemInfos} />;
};
