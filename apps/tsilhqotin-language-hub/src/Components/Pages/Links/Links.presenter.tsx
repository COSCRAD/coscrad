import { LinkInfo } from '../../../Configs/global.config';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import { LinkPresenter } from './Link.presenter';

type HasLinkInfos = {
    linkInfos: LinkInfo[];
};

// Note the plural- this presents all Funders in a list.
export const LinksPresenter = ({ linkInfos }: HasLinkInfos): JSX.Element => {
    // compile unique categories
    const categories = [...new Set(linkInfos.map(({ category }) => category))];

    const sortedLinkInfos: [string, LinkInfo[]][] = categories.map((category) => [
        category,
        linkInfos.filter((linkInfo) => linkInfo.category === category),
    ]);

    return (
        <div className="page">
            <ScrollToTop />

            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Links</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                {sortedLinkInfos.flatMap(([category, linkInfoForCategory]) => (
                    <>
                        {/* <div key={category}>{category}</div>*/}
                        {linkInfoForCategory.map((linkInfo) => (
                            <LinkPresenter {...linkInfo} key={linkInfo.name}></LinkPresenter>
                        ))}
                    </>
                ))}
            </div>
        </div>
    );
};
