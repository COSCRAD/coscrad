import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';

/**
 * The purpose of the base '/' endpoint is to give us a sanity check that the
 * server is up and running properly. The purpose of this test is to give some
 * guidance in how to setup more complex e2e tests of our api.
 */
describe('GET /', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [],
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    const expectedDataInResponse = {
        message: 'Welcome to the COSCRAD API!',
    };

    it(`should get the welcome message`, () => {
        return request(app.getHttpServer()).get('/').expect(200).expect(expectedDataInResponse);
    });

    afterAll(async () => {
        await app.close();
    });
});
