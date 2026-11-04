exports.fail = (status, message, errors = []) => Object.assign(new Error(message), { status, errors });
exports.ok = (res, data, status = 200, meta) => res.status(status).json({ ok: true, data, ...(meta ? { meta } : {}) });
