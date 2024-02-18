import { remove as removeAccents } from "remove-accents";
import { uniques } from "./array";

/**
 * Treat the `string` by trimming, lowercasing and removing accents
 * @param string String to treat
 */
export function treat(string: string): string {
  return removeAccents(string.toLowerCase().trim());
}

/**
 * Compares the letters between `stringA` and `stringB`
 * @param stringA Target main string
 * @param stringB String to compare to `stringA`
 * @returns How much `stringA`'s letters includes `stringB`'s letters 
 */
export function compareLetters(stringA: string, stringB: string): number {
  const splitA = stringA.split('').filter(c => !/\s/.test(c)); // Splitting string into chars and filtering spaces
  const splitB = stringB.split('').filter(c => !/\s/.test(c)); // Splitting string into chars and filtering spaces

  // Mapping the unique values in splitA to calculate
  // the ocurrance rate between splitB letters and splitA
  // letters. If splitB have more of that char than splitA,
  // than the maximum value of 1 (100%) is returned.
  const comparison = uniques(splitA).map(ca => Math.min(splitB.filter(c => c === ca).length / splitA.filter(c => c === ca).length, 1));
  return comparison.reduce((a, b) => a + b, 0) / splitA.length;
}

/**
 * Sorts `items` by accuracy with `query`
 * @param query Query to sort `items`
 * @param items List to be sorted
 * @param selector If `items` is not a `string` Array, selector is a way to define which value for `items` you want to sort. Default behavior, if `selector` is missing, is to convert each value in `items` using `String(item)`.
 * @returns Sorted `items` list
 */
export function querySort<T>(query: string, items: T[], selector?: (item: T) => string): [number, T][] {
  const _selector = typeof selector === 'function' ? selector : (v: T) => String(v)
  return items.map(i => [compareLetters(query, _selector(i)), i] as [number, T])
    .sort((a, b) => b[0] - a[0])
}