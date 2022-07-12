import * as request from 'supertest';
import { AggregateId } from '../../../../domain/types/AggregateId';
import httpStatusCodes from '../../../constants/httpStatusCodes';

export default (res: request.Response, aggregateId: AggregateId) => {
    expect(res.status).toBe(httpStatusCodes.ok);

    expect(res.body.data.id).toBe(aggregateId);

    expect(res.body).toMatchSnapshot();
};
