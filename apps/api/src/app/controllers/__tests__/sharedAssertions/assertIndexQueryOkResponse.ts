import * as request from 'supertest';
import httpStatusCodes from '../../../constants/httpStatusCodes';

export default (res: request.Response) => {
    expect(res.status).toBe(httpStatusCodes.ok);

    expect(res.body).toMatchSnapshot();
};
