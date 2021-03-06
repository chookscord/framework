import { Dirent } from 'fs'
import walk from '../src/internals/walk'
import { opendir } from 'fs/promises'

jest.mock('fs/promises')

const file = (name: string, isDir: boolean) => {
  const dirent = new Dirent()
  dirent.name = name
  dirent.isDirectory = () => isDir
  return dirent
}

describe('file traversal', () => {
  afterEach(jest.clearAllMocks)

  it('rejects non-absolute paths', async () => {
    await expect(walk('path').next()).rejects.toThrow()
  })

  it('walks the fs', async () => {
    (<jest.Mock>opendir).mockImplementation((path: string) => {
      return (function* () {
        if (path === '/') {
          yield file('foo.js', false)
          yield file('dir', true)
        }
        if (path === '/dir') {
          yield file('bar.js', false)
        }
      }())
    })

    const testFile = jest.fn()
    const files = walk('/')

    for await (const path of files) {
      testFile(path)
    }

    expect(opendir).toHaveBeenCalledTimes(2)
    expect(testFile).toHaveBeenCalledWith({ name: 'foo.js', path: '/foo.js' })
    expect(testFile).toHaveBeenCalledWith({ name: 'bar.js', path: '/dir/bar.js' })
  })

  it('filters files', async () => {
    (<jest.Mock>opendir).mockReturnValueOnce((function* () {
      yield file('foo.js', false)
      yield file('.bar.js', false)
    }()))

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const files = walk('/', { ignore: file => file.name.startsWith('.') })
    const testFile = jest.fn()

    for await (const path of files) {
      testFile(path)
    }

    expect(testFile).toHaveBeenCalledWith({ name: 'foo.js', path: '/foo.js' })
    expect(testFile).not.toHaveBeenCalledWith({ name: 'bar.js', path: '/.bar.js' })
  })
})
