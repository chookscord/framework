import fs from 'fs';
import { opendir } from 'fs/promises';
import { traverse } from '../src/lib/traverse';

jest.mock('fs/promises');
const mockedOpendir = opendir as jest.Mock<ReturnType<typeof opendir>>;

function createDirent(fileName: string, isDirectory: boolean): fs.Dirent {
  const dirent = new fs.Dirent();
  dirent.name = fileName;
  dirent.isDirectory = () => isDirectory;
  return dirent;
}

function *mockGenerator() {
  yield createDirent('foo', false);
  yield createDirent('bar', true);
}

test('loader', async () => {
  mockedOpendir.mockReturnValue(Promise.resolve(mockGenerator() as never));
  const listener = jest.fn();

  const files = traverse('/path');
  for await (const file of files!) {
    listener(file);
  }

  expect(listener).toHaveBeenCalledTimes(2);
  expect(listener).toHaveBeenCalledWith({ isDir: false, path: '/path/foo' });
  expect(listener).toHaveBeenCalledWith({ isDir: true, path: '/path/bar' });
});
