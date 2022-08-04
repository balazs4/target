const test = require('node:test');
const assert = require('assert').strict;

test('all good', (t) => {
  const raw = [
    'xxxxxxxxxxxxxxxxxxx',
    'yyyyyyyyyyyyyyyyyyyyyyyyyyy',
    'x_type_0',
    'x_id_0',
    'x_name_0',
    JSON.stringify({
      _from: 'previous',
      foo: 'bar0',
      bazz: 42,
    }),
    'x_type_1',
    'x_id_1',
    'x_name_1',
    JSON.stringify({
      _from: 'previous',
      foo: 'bar1',
      bazz: 42,
    }),
    'x_type_2',
    'x_id_2',
    'x_name_2',
    JSON.stringify({
      _from: 'next',
      foo: 'bar2',
      bazz: 42,
    }),
  ];

  const headers = {
    allx: 0,
    ally: 1,
    target_type_0: 2,
    target_id_0: 3,
    target_name_0: 4,
    target_metadata_0: 5,
    target_type_1: 6,
    target_id_1: 7,
    target_name_1: 8,
    target_metadata_1: 9,
    target_type_2: 10,
    target_id_2: 11,
    target_name_2: 12,
    target_metadata_2: 13,
  };

  const expected = {
    x: 'xxxxxxxxxxxxxxxxxxx',
    y: 'yyyyyyyyyyyyyyyyyyyyyyyyyyy',
    previous: {
      x_type_0: {
        name: 'x_name_0',
        id: 'x_id_0',
        foo: 'bar0',
        bazz: 42,
      },
      x_type_1: {
        name: 'x_name_1',
        id: 'x_id_1',
        foo: 'bar1',
        bazz: 42,
      },
    },
    next: {
      x_type_2: {
        name: 'x_name_2',
        id: 'x_id_2',
        foo: 'bar2',
        bazz: 42,
      },
    },
  };

  const actual = (() => {
    const { previous, next } = Object.entries(headers)
      .filter(([key]) => /target_/.test(key))
      .reduce((acc, [col, colindex]) => {
        const [, suffix, index] = col.split('_');
        if (acc[index] === undefined) acc[index] = {};
        acc[index][suffix] =
          suffix === 'metadata' ? JSON.parse(raw[colindex]) : raw[colindex];
        return acc;
      }, [])
      .reduce(
        (acc, target) => {
          const { _from, ...rest } = target.metadata;
          acc[_from] = {
            ...acc[_from],
            [target.type]: { id: target.id, name: target.name, ...rest },
          };
          return acc;
        },
        { previous: {}, next: {} }
      );

    return {
      x: raw[headers['allx']],
      y: raw[headers['ally']],
      previous,
      next,
    };
  })();

  assert.deepEqual(actual, expected);
});
