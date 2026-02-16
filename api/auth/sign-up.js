import handler from '../auth.js';

export default async function (req, res) {
    try {
        req.url = '/sign-up';
        return await handler(req, res);
    } catch (err) {
        console.error('auth/sign-up wrapper error:', err);
        return res.status(500).json({ message: 'Wrapper error', error: String(err && err.stack ? err.stack : err) });
    }
}
