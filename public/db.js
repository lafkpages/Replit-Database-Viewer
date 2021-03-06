class DBError extends Error
{
  constructor (message)
  {
    super(message);
    this.name = 'DBError';
  }
}

class DB
{
  constructor (url=null)
  {
    if (url)
    this.setURL(url);
  }

  setURL(url)
  {
    this.url = url;
  }

  _URLError()
  {
    if (!this.url)
    throw new DBError(`No URL specified`);
  }

  _get_url(key)
  {
    return `/db/get?url=${btoa(this.url)}&key=${btoa(key)}`;
  }

  async get(key, raw=false)
  {
    this._URLError();

    let resp = await fetch(this._get_url(key));

    if (resp.status == 200)
    {
      if (raw)
      return await resp.text();

      else
      return await resp.json();
    }
    else
    {
      throw new DBError(`Error getting key \"${key}\"`);
    }
  }

  _set_url(key, val)
  {
    return `/db/set?url=${btoa(this.url)}&key=${btoa(key)}&val=${btoa(JSON.stringify(val))}`;
  }

  async set(key, val)
  {
    this._URLError();

    let resp = await fetch(this._set_url(key, val));

    if (resp.status == 200)
    {
      return await resp.text();
    }
    else
    {
      throw new DBError(`Error setting key \"${key}\" to ${val}`);
    }
  }

  _delete_url(key)
  {
    return `/db/del?url=${btoa(this.url)}&key=${btoa(key)}`;
  }

  async delete(key)
  {
    this._URLError();

    let resp = await fetch(this._delete_url(key));

    if (resp.status == 200)
    {
      return await resp.text();
    }
    else
    {
      throw new DBError(`Error deleting key \"${key}\"`);
    }
  }

  _list_url(pfx)
  {
    return `/db/lst?url=${btoa(this.url)}&pfx=${btoa(pfx)}`;
  }

  async list(pfx='')
  {
    this._URLError();

    let resp = await fetch(this._list_url(pfx));

    if (resp.status == 200)
    {
      const raw = await resp.text();

      if (raw.length == 0)
      return [];

      return raw
      .split('\n')
      .map(decodeURIComponent);
    }
    else
    {
      throw new DBError(`Error listing keys with prefix \"${pfx}\"`);
    }
  }
}