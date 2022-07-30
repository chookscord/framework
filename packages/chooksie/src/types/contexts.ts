import type { Interaction } from 'discord.js'
import type { BaseContext } from './base.js'

export interface InteractionContext<T extends Interaction = Interaction> extends BaseContext {
  interaction: T
}
