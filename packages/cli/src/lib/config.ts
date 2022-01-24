import Joi from 'joi'

export interface BotCredentials {
  token: string
  appId?: string
}

export interface ChooksConfig {
  credentials: BotCredentials
  [key: string]: unknown
}

const configSchema = Joi.object<ChooksConfig>({
  credentials: Joi.object<BotCredentials>({
    appId: Joi.string(),
    token: Joi.string().required(),
  }).required(),
}).unknown(true)

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? DeepPartial<U>[] :
    T[P] extends object ? DeepPartial<T[P]> :
      T[P];
}

export function validateConfig(config: DeepPartial<ChooksConfig>): Joi.ValidationError | null {
  return configSchema.validate(config).error ?? null
}
