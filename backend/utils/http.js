export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export const message = (res, text, status = 200, extra = {}) => res.status(status).json({ success: true, message: text, ...extra });

export const fail = (res, text, status = 400, extra = {}) => res.status(status).json({ success: false, message: text, ...extra });

export const slugify = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)+/g, '');
