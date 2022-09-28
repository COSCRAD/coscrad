import { Divider } from '@mui/material';
import { FunderInfo } from '../../../Configs/global.config';
import ScrollToTop from '../../Widgets/ScrollButton/ScrollToTop';
import { FunderPresenter } from './Funder.presenter';

type HasFunderInfos = {
    funderInfos: FunderInfo[];
};

// Note the plural- this presents all Funders in a list.
export const FundersPresenter = ({ funderInfos }: HasFunderInfos): JSX.Element => {
    // compile unique categories
    const categories = [...new Set(funderInfos.map(({ category }) => category))];

    const sortedFunderInfos: [string, FunderInfo[]][] = categories.map((category) => [
        category,
        funderInfos.filter((funderInfo) => funderInfo.category === category),
    ]);

    return (
        <div className="page">
            <ScrollToTop />

            <div id="heading">
                <div id="container">
                    <h1 id="pageTitle">Funders</h1>
                </div>
            </div>
            <div id="aboutContent" className="pageContent">
                {sortedFunderInfos.flatMap(([category, funderInfoForCategory]) => (
                    <>
                        <h3 className="funderCategory" key={category}>
                            {category}
                        </h3>
                        <Divider className="divider" />
                        {funderInfoForCategory.map((funderInfo) => (
                            <FunderPresenter
                                {...funderInfo}
                                key={funderInfo.name}
                            ></FunderPresenter>
                        ))}
                    </>
                ))}
            </div>
        </div>
    );
};
