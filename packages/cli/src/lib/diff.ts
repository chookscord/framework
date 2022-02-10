/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ChannelOption, Choice, Command, NumberOption, Option, SlashCommand, SlashSubcommand, StringOption, Subcommand, SubcommandGroup } from 'chooksie'

// true = values are different

function diffBoth<T>(a: T[], b: T[], callbackfn: (a: T, b: T) => boolean): boolean {
  if (a.length !== b.length) return true

  for (let i = 0, len = a.length; i < len; i++) {
    if (callbackfn(a[i], b[i])) {
      return true
    }
  }

  return false
}

function diffChoice(a: Choice, b: Choice): boolean {
  return a.name !== b.name || a.value !== b.value
}

function diffStringOrNumber<T extends StringOption | NumberOption>(a: T, b: T): boolean {
  if (typeof a.autocomplete !== typeof b.autocomplete) return true

  const aIsArray = Array.isArray(a.choices)
  const bIsArray = Array.isArray(b.choices)

  if (aIsArray !== bIsArray && (a.choices?.length ?? 0) !== (b.choices?.length ?? 0)) return true
  if (aIsArray && bIsArray && diffBoth(<Choice[]>a.choices, <Choice[]>b.choices, diffChoice)) return true

  return false
}

function diffNumber(a: NumberOption, b: NumberOption): boolean {
  if (a.minValue !== b.minValue) return true
  if (a.maxValue !== b.maxValue) return true

  return diffStringOrNumber(a, b)
}

function diffString(a: StringOption, b: StringOption): boolean {
  return diffStringOrNumber(a, b)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function diffSubcommand(a: Subcommand<any>, b: Subcommand<any>): boolean {
  const aIsArray = Array.isArray(a.options)
  const bIsArray = Array.isArray(b.options)

  if (aIsArray !== bIsArray && (a.options?.length ?? 0) !== (b.options?.length ?? 0)) return true
  if (aIsArray && bIsArray && diffBoth(a.options!, b.options!, diffOption)) return true

  return false
}

function diffSubcommandGroup(a: SubcommandGroup, b: SubcommandGroup): boolean {
  return diffBoth(a.options, b.options, diffOption)
}

function diffChannel(a: ChannelOption, b: ChannelOption): boolean {
  const aIsArray = Array.isArray(a.channelTypes)
  const bIsArray = Array.isArray(b.channelTypes)

  if (aIsArray !== bIsArray && (a.channelTypes?.length ?? 0) !== (b.channelTypes?.length ?? 0)) return true

  const sort = (type1: string, type2: string) => type1.localeCompare(type2)
  const list1 = a.channelTypes?.sort(sort)
  const list2 = b.channelTypes?.sort(sort)

  if (list1 && list2 && diffBoth(list1, list2, (type1, type2) => type1 !== type2)) return true

  return false
}

function diffOption(a: Option, b: Option): boolean {
  if (a.name !== b.name) return true
  if (a.description !== b.description) return true
  if (a.type !== b.type) return true
  if (Boolean(a.required) !== Boolean(b.required)) return true

  switch (a.type) {
    case 'SUB_COMMAND':
      return diffSubcommand(a, b as never)
    case 'SUB_COMMAND_GROUP':
      return diffSubcommandGroup(a, b as never)
    case 'NUMBER':
    case 'INTEGER':
      return diffNumber(a, b as never)
    case 'STRING':
      return diffString(a, b as never)
    case 'CHANNEL':
      return diffChannel(a, b as never)
  }

  return false
}

function diffSlashCommand<T extends SlashCommand | SlashSubcommand>(a: T, b: T): boolean {
  if (a.description !== b.description) return true

  const aIsArray = Array.isArray(a.options)
  const bIsArray = Array.isArray(b.options)

  if (aIsArray !== bIsArray) return true
  if (aIsArray && bIsArray && diffBoth(<Option[]>a.options, <Option[]>b.options, diffOption)) return true

  return false
}

function diffCommand(a: Command, b: Command): boolean {
  if (a.name !== b.name) return true
  if ((a.type ?? 'CHAT_INPUT') !== (b.type ?? 'CHAT_INPUT')) return true
  if (Boolean(a.defaultPermission) !== Boolean(b.defaultPermission)) return true

  if ((a.type ?? 'CHAT_INPUT') === 'CHAT_INPUT') {
    return diffSlashCommand(a as never, b as never)
  }

  return false
}

export { diffOption, diffCommand }
