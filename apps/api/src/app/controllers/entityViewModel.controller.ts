import { Controller, Get, Query, Res } from '@nestjs/common';
import { EntityId } from '../../domain/models/types/entity-id';
import { isEntityId } from '../../domain/types/entity-id';
import { isEntityType } from '../../domain/types/entityType';
import { isInternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import buildViewModelForEntity from '../../view-models/buildViewModelForEntity/buildViewModelForEntity';
import { VocabularyListViewModel } from '../../view-models/buildViewModelForEntity/viewModels';
import { TagViewModel } from '../../view-models/buildViewModelForEntity/viewModels/TagViewModel';
import {
  TermViewModel,
  ViewModelId,
} from '../../view-models/buildViewModelForEntity/viewModels/TermViewModel';
import { buildAllEntityDescriptions } from '../../view-models/entityDescriptions/buildAllEntityDescriptions';
import httpStatusCodes from '../constants/httpStatusCodes';
import filterOutUnpublishedEntities from './utilities/filterOutUnpublishedEntities';

type HasViewModelId = {
  id: ViewModelId;
};

const NotProvided = Symbol('Client did not provide this param');

const wasNotProvided = (input: unknown): input is typeof NotProvided =>
  input === NotProvided;

const findEntityById = <T extends HasViewModelId>(
  idToFind: EntityId,
  allEntities: T[]
): Maybe<T> => {
  const searchResult =
    allEntities.find(({ id }) => id === idToFind) || NotFound;

  return searchResult;
};

@Controller('entities')
export class EntityViewModelController {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  @Get()
  async fetchMany(
    @Res() res,
    @Query('type') type: string,
    @Query('id') id: unknown = NotProvided
  ) {
    // TODO [refactor] move this in to a param validation layer
    if (!isEntityType(type)) {
      // TODO add error message
      return res.sendStatus(400);
    }

    // TODO avoid double-negative
    if (!wasNotProvided(id) && !isEntityId(id)) {
      // TODO add error message
      return res.sendStatus(400);
    }

    const allEntities = await buildViewModelForEntity(type, {
      repositoryProvider: this.repositoryProvider,
    });

    if (isInternalError(allEntities))
      return res.status(httpStatusCodes.internalError).send({
        error: JSON.stringify(allEntities),
      });

    // This is doing too much!
    const result = !wasNotProvided(id)
      ? // TODO remove cast
        findEntityById<TermViewModel | VocabularyListViewModel | TagViewModel>(
          id,
          allEntities
        )
      : allEntities;

    if (isNotFound(result)) return res.sendStatus(httpStatusCodes.notFound);

    return Array.isArray(result)
      ? res
          .status(httpStatusCodes.ok)
          // TODO remove cast
          .send(filterOutUnpublishedEntities(result as any))
      : res.status(httpStatusCodes.ok).send(result);
  }

  @Get('descriptions')
  getAllEntityDescriptions() {
    return buildAllEntityDescriptions();
  }
}
