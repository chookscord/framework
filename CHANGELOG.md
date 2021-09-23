# Changelog

## 0.11.0 - 24/09/21

### Fixed

- Non framework-related files not being built.

### Added

- Better validation.
- Types re-exports path.

### Changed

- Split discord.js reexport to subpath.

## 0.10.0 - 05/09/21

### Added

- Support for subcommands.

### Changed

- Removed `Slash` prefix on helper functions.
- Combined stores into one generic store.

## 0.9.0 - 30/08/21

### Fixed

- Interaction option types.

### Added

- More cli commands.
  - Build command.
  - Production mode.
  - Register interactions command.
- First-class TypeScript support without extra config.
- Better logging util using `consola` and `chalk`.
- `fetch` util using `node-fetch`.

### Changed

- Moved compiler from `tsc` to `swc`.
- Moved file watcher from `fs` to `chokidar`.
- Merged compile package to framework.
- Optimized package size by importing helper packages.

### Removed

- Auto detecting `typescript` package.
- Text commands.

## 0.5.1 - 16/08/21

### Fixed

- Fixed missing `dotenv` import.

## 0.5.0 - 16/08/21

### Fixed

- Basic support for slash commands!

### Added

- Hot module reloads for slash commands.

### Changed

- BREAKING: Updated config interface.
- Optimized file loading.

### Removed

- `node-fetch` util.

## 0.3.0 - 13/08/21

### Added

- Change log file.
- Hot command reloads.
- Auto detect and switch to typescript compiler.

### Removed

- Removed typescript and ts-node from dependencies.

### Fixed

- `ready` event now registers correctly.

## 0.2.1

### Notes

- Removed breaking swc dependency.

## 0.2.0

### Notes

- Added support for slash commands.

## 0.1.0

### Notes

- Initial commit.
