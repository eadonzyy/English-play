export const Router = {
  parse() {
    const raw = location.hash || '#login';
    const [path, queryString = ''] = raw.replace(/^#/, '').split('?');
    const query = Object.fromEntries(new URLSearchParams(queryString));
    return { path, query };
  },
  go(path, query = {}) {
    const qs = new URLSearchParams(query).toString();
    location.hash = qs ? `${path}?${qs}` : path;
  }
};
