import * as migration_20261106_100555_initial from './20261106_100555_initial'

export const migrations = [
  {
    up: migration_20261106_100555_initial.up,
    down: migration_20261106_100555_initial.down,
    name: '20261106_100555_initial',
  },
]
