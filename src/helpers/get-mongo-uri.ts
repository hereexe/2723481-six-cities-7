export function getMongoURI(host: string, port: number, database: string, user: string, password: string): string {
  const hostname = host.includes(':') ? `[${host}]` : host;
  const credentials = user ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}@` : '';
  const options = user ? '?authSource=admin' : '';

  return `mongodb://${credentials}${hostname}:${port}/${encodeURIComponent(database)}${options}`;
}
