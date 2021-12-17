import type { Dirent } from 'fs';
import { traverse } from '../src/lib/traverse';

const newFile = (name: string, isDir: boolean) => ({ name, isDirectory: () => isDir }) as Dirent;

function *levelOne(): Generator<Dirent> {
  yield newFile('foo.js', false);
  yield newFile('two', true);
}

function *levelTwo(): Generator<Dirent> {
  yield newFile('bar.js', false);
}

function *opendir(path: string): Generator<Dirent> {
  if (path === '/one') yield* levelOne();
  else if (path === '/one/two') yield* levelTwo();
}

const loader = jest.fn(opendir);

describe('file traversal', () => {
  afterEach(jest.clearAllMocks);

  it('rejects non-absolute paths', async () => {
    await expect(traverse('path').next()).rejects.toThrow();
  });

  it('crawls the root dir only', async () => {
    const testFile = jest.fn();
    const files = traverse('/one', { loader: loader as never });

    for await (const file of files) {
      testFile(file.path, file.isDir);
    }

    expect(loader).toHaveBeenCalledTimes(1);
    expect(testFile).toHaveBeenCalledWith('/one/foo.js', false);
    expect(testFile).toHaveBeenCalledWith('/one/two', true);
  });

  it('traverses recursively', async () => {
    const testFile = jest.fn();
    const files = traverse('/one', { loader: loader as never, recursive: true });

    for await (const file of files) {
      testFile(file.path, file.isDir);
    }

    expect(loader).toHaveBeenCalledTimes(2);
    expect(testFile).toHaveBeenCalledWith('/one/foo.js', false);
    expect(testFile).toHaveBeenCalledWith('/one/two', true);
    expect(testFile).toHaveBeenCalledWith('/one/two/bar.js', false);
  });
});
