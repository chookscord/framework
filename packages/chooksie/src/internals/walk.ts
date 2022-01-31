import { opendir } from 'fs/promises'
import { isAbsolute, join } from 'path'

interface WalkOptions {
  ignore?: (path: string) => boolean
}

async function* walk(path: string, opts: WalkOptions = {}): AsyncGenerator<string, void> {
  if (!isAbsolute(path)) {
    throw new Error('An absolute path was not provided!')
  }

  const ignore = opts.ignore ?? (() => false)
  const dir = await opendir(path)

  for await (const dirent of dir) {
    const target = join(path, dirent.name)
    if (ignore(target)) continue

    if (dirent.isDirectory()) {
      yield* walk(target, opts)
    } else {
      yield target
    }
  }
}

export default walk
