import { Controller, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import TagAlreadyExistsError from '../../domain/domainModelValidators/errors/tag/TagAlreadyExistsError';
import tagValidator from '../../domain/domainModelValidators/tagValidator';
import { Tag } from '../../domain/models/tag/tag.entity';
import { entityTypes } from '../../domain/types/entityTypes';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import { PartialDTO } from '../../types/partial-dto';
import httpStatusCodes from '../constants/httpStatusCodes';

@Controller('tags')
export class AddTagController {
    constructor(private readonly repositoryProvider: RepositoryProvider) {}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async addOneTag(@Res() res, @Query('text') text: string) {
        const tagRepository = this.repositoryProvider.forEntity<Tag>(entityTypes.tag);

        // We should add `Where filters`
        const allTagsQueryResult = await tagRepository.fetchMany();

        const allErrors = allTagsQueryResult.filter((result): result is InternalError =>
            isInternalError(result)
        );

        if (allErrors.length)
            return res.status(httpStatusCodes.badRequest).send(JSON.stringify(allTagsQueryResult));

        // We have established there were no errors at this point
        const allTags = allTagsQueryResult as Tag[];

        const existingTagWithSameText = allTags.find(
            ({ text: textOfExistingTag }) => text === textOfExistingTag
        );

        // Check if there is already a tag with the requested text
        if (existingTagWithSameText)
            return res
                .status(httpStatusCodes.badRequest)
                .send(JSON.stringify(new TagAlreadyExistsError(text)));

        const createTagDto: PartialDTO<Tag> = {
            text,
        };

        const domainValidationResult = tagValidator(createTagDto);

        if (isInternalError(domainValidationResult))
            return res
                .status(httpStatusCodes.badRequest)
                .send(JSON.stringify(domainValidationResult));

        await tagRepository.create(new Tag(createTagDto));

        // Send `Ack`
        return res.sendStatus(httpStatusCodes.ok);
    }

    // TODO support update
    // @UseGuards(AuthGuard('jwt'))
    // @Put()
    // async updateTag(
    //   @Res() res,
    //   @Query('id') id: string,
    //   @Query('text') text: string
    // ) {
    //   if (!isEntityId(id))
    //     return res.status(httpStatusCodes.badRequest).send('Invalid tag id');

    //   if (!isStringWithNonzeroLength(text))
    //     return res.status(httpStatusCodes.badRequest).send('Invalid tag text');

    //   const tagRepository = this.repositoryProvider.forEntity<Tag>(
    //     entityTypes.tag
    //   );

    //   const existingTagResult = await tagRepository.fetchById(id);

    //   if (isInternalError(existingTagResult))
    //     return res.status(httpStatusCodes.badRequest).send('error fetching tag');

    //   if (isNotFound(existingTagResult))
    //     return res
    //       .status(httpStatusCodes.badRequest)
    //       .send(`There is no tag with id: ${id}`);

    //   existingTagResult;
    // }
}
