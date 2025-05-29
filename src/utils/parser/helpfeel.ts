import {
  bind,
  orElse,
  Parser,
  pure,
  sat,
  some,
  symbol,
} from 'ts-monadic-parser';

const letter = sat((x) => /[^()|]/.test(x));
const str: Parser<string[]> = bind(some(letter), (s) => pure([s.join('')]));

// factor = '('literal')' | str
export const factor: Parser<string[]> = orElse(
  bind(symbol('('), () =>
    bind(literal, (lit) => bind(symbol(')'), () => pure(lit))),
  ),
  str,
);

// synonym = factor(+synonym | ε)
export const synonym: Parser<string[]> = bind(
  orElse(
    factor,
    bind(symbol('|'), () => bind(synonym, (syn) => pure([''].concat(syn)))),
  ),
  (f) =>
    orElse(
      bind(symbol('|'), () => bind(synonym, (syn) => pure(f.concat(syn)))),
      pure(f),
    ),
);

// literal = synonym(*literal | ε)
export const literal: Parser<string[]> = bind(synonym, (syn) => {
  return orElse(
    bind(literal, (lit) =>
      pure(syn.flatMap((x) => lit.map((y) => x.concat(y)))),
    ),
    pure(syn),
  );
});
