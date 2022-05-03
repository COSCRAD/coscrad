import { Controller } from '@nestjs/common';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';

@Controller('tags')
export class AddTagController {
    constructor(private readonly repositoryProvider: RepositoryProvider) {}

    // @UseGuards(AuthGuard('jwt'))
    // @Post()
    // async addOneTag(@Res() res, @Query('text') text: string) {
    //     const tagRepository = this.repositoryProvider.forResource<Tag>(resourceTypes.tag);

    //     // We should add `Where filters`
    //     const allTagsQueryResult = await tagRepository.fetchMany();

    //     const allErrors = allTagsQueryResult.filter((result): result is InternalError =>
    //         isInternalError(result)
    //     );

    //     if (allErrors.length)
    //         return res.status(httpStatusCodes.badRequest).send(JSON.stringify(allTagsQueryResult));

    //     // We have established there were no errors at this point
    //     const allTags = allTagsQueryResult as Tag[];

    //     const existingTagWithSameText = allTags.find(
    //         ({ text: textOfExistingTag }) => text === textOfExistingTag
    //     );

    //     // Check if there is already a tag with the requested text
    //     if (existingTagWithSameText)
    //         return res
    //             .status(httpStatusCodes.badRequest)
    //             .send(JSON.stringify(new TagAlreadyExistsError(text)));

    //     const createTagDto: DeepPartial<DTO<Tag>> = {
    //         text,
    //     };

    //     const domainValidationResult = tagValidator(createTagDto);

    //     if (isInternalError(domainValidationResult))
    //         return res
    //             .status(httpStatusCodes.badRequest)
    //             .send(JSON.stringify(domainValidationResult));

    //     // TODO We need to think about ID generation or else make ID optional here
    //     await tagRepository.create(new Tag(createTagDto as DTO<Tag>));

    //     // Send `Ack`
    //     return res.sendStatus(httpStatusCodes.ok);
    // }

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
    //     resourceTypes.tag
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
