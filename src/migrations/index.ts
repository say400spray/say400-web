import * as migration_20261106_100555_initial from './20261106_100555_initial';
import * as migration_20261123_141754_variant_photo from './20261123_141754_variant_photo';

export const migrations = [
  {
    up: migration_20261106_100555_initial.up,
    down: migration_20261106_100555_initial.down,
    name: '20261106_100555_initial',
  },
  {
    up: migration_20261123_141754_variant_photo.up,
    down: migration_20261123_141754_variant_photo.down,
    name: '20261123_141754_variant_photo'
  },
];
