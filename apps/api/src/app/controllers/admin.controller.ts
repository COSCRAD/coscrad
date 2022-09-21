import { getCoscradDataSchema } from '@coscrad/data-types';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AggregateType } from '../../domain/types/AggregateType';
import { TagViewModel } from '../../view-models/buildViewModelForResource/viewModels';
import { CateogryTreeViewModel } from '../../view-models/buildViewModelForResource/viewModels/category-tree.view-model';
import { CoscradUserGroupViewModel } from '../../view-models/buildViewModelForResource/viewModels/coscrad-user-group.view-model';
import { CoscradUserViewModel } from '../../view-models/buildViewModelForResource/viewModels/coscrad-user.view-model';

export const ADMIN_BASE_ROUTE = 'admin';

export const SWAGGER_TAG_ADMIN = 'admin';

@ApiTags(SWAGGER_TAG_ADMIN)
@Controller(ADMIN_BASE_ROUTE)
export class AdminController {
    @Get('')
    async getSchemas() {
        return [
            {
                type: AggregateType.user,
                schema: getCoscradDataSchema(CoscradUserViewModel),
            },
            {
                type: AggregateType.userGroup,
                schema: getCoscradDataSchema(CoscradUserGroupViewModel),
            },
            {
                type: AggregateType.tag,
                schema: getCoscradDataSchema(TagViewModel),
            },
            {
                type: AggregateType.category,
                schema: getCoscradDataSchema(CateogryTreeViewModel),
            },
        ];
    }
}
