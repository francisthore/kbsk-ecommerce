// src/lib/utils/query.ts

/**
 * Returns all values for a query param as an array
 */
export function getArrayParam(
  search: string,
  key: string
): string[] {
  const params = new URLSearchParams(search);
  return params.getAll(key);
}

/**
 * Toggles a value in a multi-value query param
 */
export function toggleArrayParam(
  pathname: string,
  search: string,
  key: string,
  value: string
): string {
  const params = new URLSearchParams(search);
  const values = new Set(params.getAll(key));

  if (values.has(value)) {
    values.delete(value);
  } else {
    values.add(value);
  }

  params.delete(key);
  values.forEach((v) => params.append(key, v));

  // Reset pagination when filters change
  params.delete("page");

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Removes one or more query params entirely
 */
export function removeParams(
  pathname: string,
  search: string,
  keys: string[]
): string {
  const params = new URLSearchParams(search);

  keys.forEach((key) => params.delete(key));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Sets or replaces a single query param
 */
export function setParam(
  pathname: string,
  search: string,
  key: string,
  value: string
): string {
  const params = new URLSearchParams(search);

  params.set(key, value);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
