import type * as types from '@chookscord/types';
import * as validate from '@chookscord/validate';

export function validateInteraction(
  interaction: Partial<types.ChooksInteraction>,
): validate.ValidationError {
  return validate.assert(
    interaction.name!,
    validate.testInteractionName,
  );
}

export function validateCommand(
  command: Partial<types.ChooksCommand>,
): validate.ValidationError {
  return validate.assert(
    command.name!,
    validate.testCommandName,
  ) ??
  validate.assert(
    command.description!,
    validate.testDescription,
  );
}
