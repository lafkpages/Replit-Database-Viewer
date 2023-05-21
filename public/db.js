class DBError extends Error {
  constructor(message) {
    super(message);
    this.name = "DBError";
  }
}

class DB {
  constructor(opts = {}) {
    if (opts.url) this.setURL(opts.url);

    this.backend = opts.backend || "https://replit-database-viewer.luisafk.repl.co/db";

    this.replit = opts.replit || null;
  }

  setURL(url) {
    this.url = url;
  }

  _URLError() {
    // ignore if we have the Replit Extensions API
    if (this.replit) {
      return;
    }

    if (!this.url) throw new DBError(`No URL specified`);
  }

  _get_url(key) {
    return `${this.backend}/get?url=${btoa(this.url)}&key=${btoa(key)}`;
  }

  async get(key, raw = false) {
    this._URLError();

    if (this.replit) {
      const raw = await this.replit.replDb.get({
        key
      });
      return raw? raw : JSON.parse(raw);
    }

    let resp = await fetch(this._get_url(key));

    if (resp.status == 200) {
      if (raw) return await resp.text();
      else return await resp.json();
    } else {
      throw new DBError(`Error getting key \"${key}\"`);
    }
  }

  _set_url(key, val) {
    return `${this.backend}/set?url=${btoa(this.url)}&key=${btoa(
      key
    )}&val=${btoa(val)}`;
  }

  async set(key, val, raw = false) {
    this._URLError();

    if (this.replit) {
      return await this.replit.replDb.set({
        key,
        value: val
      });
    }

    let resp = await fetch(this._set_url(key, raw ? val : JSON.stringify(val)));

    if (resp.status == 200) {
      return await resp.text();
    } else {
      throw new DBError(`Error setting key \"${key}\" to ${val}`);
    }
  }

  _delete_url(key) {
    return `${this.backend}/del?url=${btoa(this.url)}&key=${btoa(key)}`;
  }

  async delete(key) {
    this._URLError();

    if (this.replit) {
      return await this.replit.replDb.del({
        key
      });
    }

    let resp = await fetch(this._delete_url(key));

    if (resp.status == 200) {
      return await resp.text();
    } else {
      throw new DBError(`Error deleting key \"${key}\"`);
    }
  }

  _list_url(pfx) {
    return `${this.backend}/lst?url=${btoa(this.url)}&pfx=${btoa(pfx)}`;
  }

  async list(pfx = "") {
    this._URLError();

    if (this.replit) {
      const resp = await this.replit.replDb.list({
        prefix: pfx
      });

      if (resp.error) {
        throw new DBError(`Error listing keys via Replit API: ${resp.error}`);
      }

      return resp.keys;
    }

    let resp = await fetch(this._list_url(pfx));

    if (resp.status == 200) {
      const raw = await resp.text();

      if (raw.length == 0) return [];

      return raw.split("\n").map(decodeURIComponent);
    } else {
      throw new DBError(`Error listing keys with prefix \"${pfx}\"`);
    }
  }
}
