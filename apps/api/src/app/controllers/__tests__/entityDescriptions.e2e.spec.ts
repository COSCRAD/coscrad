import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import { buildAllEntityDescriptions } from 'apps/api/src/view-models/entityDescriptions/buildAllEntityDescriptions';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { EntityViewModelController } from '../entityViewModel.controller';
describe('GET /entities/descriptions', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/apps/api/src/app/config/${
            process.env.NODE_ENV
          }.env`,
          cache: false,
        }),
      ],
      controllers: [EntityViewModelController],
      providers: [
        DatabaseProvider,
        RepositoryProvider,
        ArangoConnectionProvider,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should get the entity descriptions', () => {
    return request(app.getHttpServer())
      .get('/entities/descriptions')
      .expect(200)
      .expect(buildAllEntityDescriptions());
  });

  afterAll(async () => {
    await app.close();
  });
});
