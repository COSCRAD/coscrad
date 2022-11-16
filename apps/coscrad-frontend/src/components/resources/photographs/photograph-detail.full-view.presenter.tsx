import { IDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { useNavigate } from 'react-router-dom';

export const PhotographDetailPresenter = ({
    data: photograph,
}: IDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    const navigate = useNavigate();

    return (
        <>
            <button onClick={() => navigate(-1)}>Back</button>
            <div>
                <h3>Photograph {photograph.id}</h3>
                <div className="detail-image-container">
                    <img src={photograph.imageURL} />
                </div>
            </div>
        </>
    );
};
