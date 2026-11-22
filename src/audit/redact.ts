const SENSITIVE = [
  'password',
  'token',
  'refresh',
  'secret',
  'card',
  'authorization',
];

export function redact(value: any): any {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        SENSITIVE.some((s) => k.toLowerCase().includes(s))
          ? '[REDACTED]'
          : redact(v),
      ]),
    );
  }
  return value;
}
