import { opendir } from 'fs/promises'
import { isAbsolute, join } from 'path'

interface WalkOptions {
  ignore?: (file: File) => boolean
}

interface File {
  name: string
  path: string
}

async function* walk(path: string, opts: WalkOptions = {}): AsyncGenerator<File, void> {
  if (!isAbsolute(path)) {
    throw new Error('An absolute path was not provided!')
  }

  const ignore = opts.ignore ?? (() => false)
  const dir = await opendir(path)

  for await (const dirent of dir) {
    const file = {
      name: dirent.name,
      path: join(path, dirent.name),
    }

    if (ignore(file)) continue

    if (dirent.isDirectory()) {
      yield* walk(file.path, opts)
    } else {
      yield file
    }
  }
}

export default walk
