import fs from 'fs';

export function watchFile(
  path: string,
  cb: () => unknown,
): void {
  fs.watchFile(
    path,
    { persistent: true, interval: 250 },
    (curr, prev) => {
      if (Number(curr.mtime) > Number(prev.mtime)) {
        cb();
      }
    },
  );
}
