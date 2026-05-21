export function toSnakeCase(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();
}