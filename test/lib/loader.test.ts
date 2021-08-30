/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chooks from '@chookscord/lib';
import * as fs from 'fs/promises';
import { Dir, Dirent } from 'fs';

jest.mock('fs/promises');
const mockedOpendir = fs.opendir as jest.Mock<ReturnType<typeof fs.opendir>>;

function createDirent(fileName: string, isDirectory: boolean): Dirent {
  const dirent = new Dirent();
  dirent.name = fileName;
  dirent.isDirectory = () => isDirectory;
  return dirent;
}

function *mockGenerator() {
  yield createDirent('foo', false);
  yield createDirent('bar', true);
}

test('loader', async () => {
  mockedOpendir.mockReturnValue(Promise.resolve(mockGenerator() as unknown as Dir));
  const listener = jest.fn();

  const files = await chooks.loadDir('path');
  for await (const file of files!) {
    listener(file);
  }

  expect(listener).toHaveBeenCalledTimes(2);
  expect(listener).toHaveBeenCalledWith({ isDirectory: false, path: 'path/foo' });
  expect(listener).toHaveBeenCalledWith({ isDirectory: true, path: 'path/bar' });
});
