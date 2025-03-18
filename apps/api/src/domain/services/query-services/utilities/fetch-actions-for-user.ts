import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import {
    CommandContext,
    CommandInfoService,
} from '../../../../app/controllers/command/services/command-info-service';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';

/*
 * Builds command forms for commands available to a given user in a given
 * aggregate context (index or detail scope for given aggregate).
 *
 * Note that if we can get to the point where all query services inherit from a
 * single base, we can use polymorphism to avoid having this helper. Until then,
 * we want to make sure we have a single-source of truth for this logic.
 */
export const fetchActionsForUser = (
    commandInfoService: CommandInfoService,
    systemUser: CoscradUserWithGroups,
    commandContext: CommandContext
): ICommandFormAndLabels[] => {
    // if (systemUser === false) return [];

    // @ts-expect-error fix me
    if (systemUser === false) {
        return [];
    }

    const isAdmin = systemUser?.isAdmin() || false;

    if (isAdmin) {
        return commandInfoService.getCommandForms(commandContext);
    }

    return [];
};
