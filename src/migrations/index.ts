import * as migration_20261106_100555_initial from './20261106_100555_initial';
import * as migration_20261123_141754_variant_photo from './20261123_141754_variant_photo';
import * as migration_20261123_201610_variant_gallery from './20261123_201610_variant_gallery';
import * as migration_20261124_100215_variant_box_sides from './20261124_100215_variant_box_sides';

export const migrations = [
  {
    up: migration_20261106_100555_initial.up,
    down: migration_20261106_100555_initial.down,
    name: '20261106_100555_initial',
  },
  {
    up: migration_20261123_141754_variant_photo.up,
    down: migration_20261123_141754_variant_photo.down,
    name: '20261123_141754_variant_photo',
  },
  {
    up: migration_20261123_201610_variant_gallery.up,
    down: migration_20261123_201610_variant_gallery.down,
    name: '20261123_201610_variant_gallery',
  },
  {
    up: migration_20261124_100215_variant_box_sides.up,
    down: migration_20261124_100215_variant_box_sides.down,
    name: '20261124_100215_variant_box_sides'
  },
];
