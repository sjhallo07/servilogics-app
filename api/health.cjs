module.exports = (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, now: Date.now() }));
    } catch (err) {
        // in case error before runtime
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, error: String(err) }));
    }
};