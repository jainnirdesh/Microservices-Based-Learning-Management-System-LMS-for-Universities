const { randomUUID } = require('crypto');

const DEFAULT_BUCKET = 'unicore-data';
let bucketInitPromise;

const getConfig = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || DEFAULT_BUCKET;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return { url, serviceRoleKey, bucket };
};

const buildHeaders = (serviceRoleKey, extraHeaders = {}) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  ...extraHeaders,
});

const buildObjectPath = (bucket, objectPath) => {
  const encodedParts = objectPath.split('/').map(encodeURIComponent).join('/');
  return `/object/${encodeURIComponent(bucket)}/${encodedParts}`;
};

const parseResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const requestStorage = async (path, options = {}) => {
  const { url, serviceRoleKey } = getConfig();
  const response = await fetch(`${url}/storage/v1${path}`, {
    ...options,
    headers: buildHeaders(serviceRoleKey, options.headers),
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    const message = typeof body === 'string' ? body : JSON.stringify(body);
    const error = new Error(`Supabase storage request failed (${response.status}): ${message}`);
    error.status = response.status;
    throw error;
  }

  return body;
};

const ensureSupabaseStorage = async () => {
  if (!bucketInitPromise) {
    bucketInitPromise = (async () => {
      const { bucket } = getConfig();

      try {
        await requestStorage('/bucket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: bucket,
            name: bucket,
            public: false,
            file_size_limit: null,
            allowed_mime_types: ['application/json'],
          }),
        });
      } catch (error) {
        const alreadyExists = error.status === 400 || error.status === 409;
        if (!alreadyExists) {
          throw error;
        }
      }
    })();
  }

  return bucketInitPromise;
};

const uploadJson = async (objectPath, payload) => {
  const { bucket } = getConfig();
  await ensureSupabaseStorage();

  await requestStorage(buildObjectPath(bucket, objectPath), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    },
    body: JSON.stringify(payload),
  });
};

const downloadJson = async (objectPath) => {
  const { bucket } = getConfig();
  await ensureSupabaseStorage();

  try {
    return await requestStorage(buildObjectPath(bucket, objectPath), { method: 'GET' });
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
};

const deleteObject = async (objectPath) => {
  const { bucket } = getConfig();
  await ensureSupabaseStorage();

  try {
    await requestStorage(buildObjectPath(bucket, objectPath), { method: 'DELETE' });
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }
};

const listObjects = async (prefix) => {
  const { bucket } = getConfig();
  await ensureSupabaseStorage();

  const items = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await requestStorage(`/object/list/${encodeURIComponent(bucket)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prefix,
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      }),
    });

    items.push(...page);

    if (page.length < limit) {
      break;
    }

    offset += page.length;
  }

  return items;
};

const matchCondition = (value, condition) => {
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    if (Object.prototype.hasOwnProperty.call(condition, '$regex')) {
      const pattern = condition.$regex || '';
      const flags = condition.$options || '';
      return new RegExp(pattern, flags).test(String(value || ''));
    }

    if (Array.isArray(condition.$in)) {
      return condition.$in.includes(value);
    }
  }

  return value === condition;
};

const matchQuery = (document, query = {}) => {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') {
      return condition.some((subQuery) => matchQuery(document, subQuery));
    }

    if (key === '$and') {
      return condition.every((subQuery) => matchQuery(document, subQuery));
    }

    const field = key === '_id' ? 'id' : key;
    return matchCondition(document[field], condition);
  });
};

const sortDocuments = (documents, sortSpec = { createdAt: -1 }) => {
  const sortEntries = Object.entries(sortSpec || {});
  if (sortEntries.length === 0) {
    return [...documents];
  }

  return [...documents].sort((left, right) => {
    for (const [field, direction] of sortEntries) {
      const leftValue = left[field] ?? null;
      const rightValue = right[field] ?? null;

      if (leftValue === rightValue) {
        continue;
      }

      if (leftValue === null) {
        return direction > 0 ? -1 : 1;
      }

      if (rightValue === null) {
        return direction > 0 ? 1 : -1;
      }

      return leftValue > rightValue ? direction : -direction;
    }

    return 0;
  });
};

const paginateDocuments = (documents, skip = 0, limit = documents.length) => {
  return documents.slice(skip, skip + limit);
};

const createCollectionStore = (collectionName, defaults = {}) => {
  const collectionPrefix = `${collectionName}/`;

  const buildRecord = (data, existingRecord) => {
    const now = new Date().toISOString();
    const base = existingRecord || {
      id: randomUUID(),
      createdAt: now,
    };

    return {
      ...defaults,
      ...base,
      ...data,
      id: existingRecord?.id || data.id || base.id,
      createdAt: existingRecord?.createdAt || data.createdAt || base.createdAt,
      updatedAt: data.updatedAt || now,
    };
  };

  const objectPathForId = (id) => `${collectionPrefix}${id}.json`;

  const getAll = async () => {
    const objects = await listObjects(collectionPrefix);
    const documents = await Promise.all(
      objects
        .filter((item) => item.name && item.name.endsWith('.json'))
        .map((item) => downloadJson(`${collectionPrefix}${item.name}`))
    );

    return documents.filter(Boolean);
  };

  return {
    async create(data) {
      const record = buildRecord(data);
      await uploadJson(objectPathForId(record.id), record);
      return record;
    },

    async getById(id) {
      return downloadJson(objectPathForId(id));
    },

    async list(query = {}, options = {}) {
      const documents = await getAll();
      const filtered = documents.filter((document) => matchQuery(document, query));
      const sorted = sortDocuments(filtered, options.sort);

      if (options.skip !== undefined || options.limit !== undefined) {
        return paginateDocuments(sorted, options.skip || 0, options.limit || sorted.length);
      }

      return sorted;
    },

    async count(query = {}) {
      const documents = await getAll();
      return documents.filter((document) => matchQuery(document, query)).length;
    },

    async update(id, updates) {
      const current = await this.getById(id);
      if (!current) {
        return null;
      }

      const record = buildRecord({ ...current, ...updates }, current);
      await uploadJson(objectPathForId(id), record);
      return record;
    },

    async replace(id, data) {
      const current = await this.getById(id);
      const record = buildRecord(data, current || { id });
      await uploadJson(objectPathForId(id), record);
      return record;
    },

    async delete(id) {
      const current = await this.getById(id);
      if (!current) {
        return null;
      }

      await deleteObject(objectPathForId(id));
      return current;
    },

    async deleteMany(query = {}) {
      const documents = await this.list(query);
      await Promise.all(documents.map((document) => deleteObject(objectPathForId(document.id))));
      return documents.length;
    },

    async updateMany(query = {}, updates = {}) {
      const documents = await this.list(query);
      await Promise.all(documents.map((document) => this.update(document.id, updates)));
      return documents.length;
    },
  };
};

module.exports = {
  createCollectionStore,
  ensureSupabaseStorage,
  matchQuery,
  paginateDocuments,
  sortDocuments,
};