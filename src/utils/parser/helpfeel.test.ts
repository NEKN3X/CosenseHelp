import { expect, test } from 'vitest';
import { literal, synonym } from './helpfeel';

test('factor', () => {
  expect(synonym('abc')).toEqual([[['abc'], '']]);
  expect(synonym('abc(xyz|123)')).toEqual([[['abc'], '(xyz|123)']]);
  expect(synonym('abc(xyz|123)def')).toEqual([[['abc'], '(xyz|123)def']]);
  expect(synonym('(|xyz)')).toEqual([[['', 'xyz'], '']]);
});
test('synonym', () => {
  expect(synonym('abc')).toEqual([[['abc'], '']]);
  expect(synonym('abc(xyz|123)')).toEqual([[['abc'], '(xyz|123)']]);
  expect(synonym('abc(xyz|123)def')).toEqual([[['abc'], '(xyz|123)def']]);
  expect(synonym('(xyz|123)')).toEqual([[['xyz', '123'], '']]);
  expect(synonym('(xyz|123|あいう)abc')).toEqual([
    [['xyz', '123', 'あいう'], 'abc'],
  ]);
});
test('literal', () => {
  expect(literal('abc')).toEqual([[['abc'], '']]);
  expect(literal('(xyz)')).toEqual([[['xyz'], '']]);
  expect(literal('((xyz))')).toEqual([[['xyz'], '']]);
  expect(literal('(xyz|123)')).toEqual([[['xyz', '123'], '']]);
  expect(literal('abc(|xyz)')).toEqual([[['abc', 'abcxyz'], '']]);
  expect(literal('(xyz|123)abc')).toEqual([[['xyzabc', '123abc'], '']]);
  expect(literal('abc(xyz|123|あいう)')).toEqual([
    [['abcxyz', 'abc123', 'abcあいう'], ''],
  ]);
  expect(literal('abc(xyz|123)def')).toEqual([
    [['abcxyzdef', 'abc123def'], ''],
  ]);
});
