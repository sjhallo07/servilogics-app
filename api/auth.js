let DEFAULT_USERS, createUserDb, getUserByEmailDb;
let hashPassword, signJwt, verifyPassword;

const ensureImports = async () => {
    if (getUserByEmailDb) return;
    const db = await import('../backend/src/utils/db.js');
    DEFAULT_USERS = db.DEFAULT_USERS;
    createUserDb = db.createUserDb;
    getUserByEmailDb = db.getUserByEmailDb;
    const sec = await import('../backend/src/utils/security.js');
    hashPassword = sec.hashPassword;
    signJwt = sec.signJwt;
    verifyPassword = sec.verifyPassword;
};

const sanitizeUser = (user) => ({
    userId: user.userId,
    userName: user.userName,
    authority: user.authority || ['client'],
    avatar: user.avatar || '',
    email: user.email,
    canAuthorizeVideo: user.canAuthorizeVideo,
});

const findUserFallback = (email) => {
    const lowered = String(email || '').toLowerCase();
    return DEFAULT_USERS.find((user) => user.email.toLowerCase() === lowered);
};

const getJwtSecret = () => process.env.JWT_SECRET || 'change-me';
const getJwtExpiry = () => process.env.JWT_EXPIRES_IN || '24h';

export default async function handler(req, res) {
    // safe body parser: sometimes req.body is undefined in some runtimes
    const parseBody = () => {
        if (req.body) return req.body;
        if (req.rawBody) {
            try {
                return JSON.parse(req.rawBody.toString());
            } catch (_) {
                return undefined;
            }
        }
        return undefined;
    };

    try {
        await ensureImports();
    } catch (err) {
        console.error('Failed to load dependencies in auth handler:', err && err.stack ? err.stack : err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    // Health / info
    if (req.method === 'GET' && (req.url === '/' || req.url === '/')) {
        return res.status(200).json({ message: 'auth handler', ok: true });
    }

    // SIGN IN
    if (req.method === 'POST' && req.url.endsWith('/sign-in')) {
        const body = parseBody() || {};
        const { email, password } = body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        try {
            const user = await getUserByEmailDb(email);
            const isPasswordValid = user
                ? (await verifyPassword(password, user.password)) || user.password === password
                : false;
            if (!user || !isPasswordValid) {
                // fallback to default users
                const fallbackUser = findUserFallback(email);
                if (fallbackUser) {
                    const fallbackMatch = (await verifyPassword(password, fallbackUser.password)) || fallbackUser.password === password;
                    if (fallbackMatch) {
                        return res.status(200).json({ token: signJwt({ sub: fallbackUser.userId, email: fallbackUser.email, authority: fallbackUser.authority || ['client'] }, getJwtSecret(), getJwtExpiry()), user: sanitizeUser(fallbackUser) });
                    }
                }
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            return res.status(200).json({ token: signJwt({ sub: user.userId, email: user.email, authority: user.authority || ['client'] }, getJwtSecret(), getJwtExpiry()), user: sanitizeUser(user) });
        } catch (error) {
            console.error('Sign-in failed:', error && error.stack ? error.stack : error);
            return res.status(500).json({ message: 'Sign-in failed' });
        }
    }

    // SIGN UP
    if (req.method === 'POST' && req.url.endsWith('/sign-up')) {
        const body = parseBody() || {};
        const { userName, email, password } = body;
        if (!userName || !email || !password) {
            return res.status(400).json({ message: 'User name, email, and password are required' });
        }
        try {
            const existing = await getUserByEmailDb(email);
            if (existing) {
                return res.status(409).json({ message: 'User already exists' });
            }

            const created = await createUserDb({ userName, email, password: await hashPassword(password), authority: ['client'] });
            return res.status(201).json({ token: signJwt({ sub: created.userId, email: created.email, authority: created.authority || ['client'] }, getJwtSecret(), getJwtExpiry()), user: sanitizeUser(created) });
        } catch (error) {
            console.error('Sign-up failed:', error && error.stack ? error.stack : error);
            return res.status(500).json({ message: 'Sign-up failed' });
        }
    }

    // SIGN IN with Google (expects { id_token })
    if (req.method === 'POST' && req.url.endsWith('/sign-in/google')) {
        const body = parseBody() || {};
        const { id_token } = body;
        if (!id_token) return res.status(400).json({ message: 'id_token is required' });
        try {
            const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`);
            if (!infoRes.ok) return res.status(401).json({ message: 'Invalid Google token' });
            const info = await infoRes.json();
            const email = info.email;
            const email_verified = info.email_verified === 'true' || info.email_verified === true;
            const name = info.name || info.email?.split('@')[0] || 'Google User';
            if (!email || !email_verified) return res.status(401).json({ message: 'Google account email not verified' });

            let user = await getUserByEmailDb(email).catch(() => null);
            if (!user) {
                user = await createUserDb({ userName: name, email, password: '', authority: ['client'] });
            }

            return res.status(200).json({ token: signJwt({ sub: user.userId, email: user.email, authority: user.authority || ['client'] }, getJwtSecret(), getJwtExpiry()), user: sanitizeUser(user) });
        } catch (err) {
            console.error('Google sign-in failed:', err && err.stack ? err.stack : err);
            return res.status(500).json({ message: 'Google sign-in failed' });
        }
    }

    // SIGN IN with GitHub (expects { access_token })
    if (req.method === 'POST' && req.url.endsWith('/sign-in/github')) {
        const body = parseBody() || {};
        const { access_token } = body;
        if (!access_token) return res.status(400).json({ message: 'access_token is required' });
        try {
            const userRes = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${access_token}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'ecme-lite',
                },
            });
            if (!userRes.ok) return res.status(401).json({ message: 'Invalid GitHub token' });
            const gh = await userRes.json();
            let email = gh.email;
            const name = gh.name || gh.login || (email ? email.split('@')[0] : 'GitHub User');

            // If email not present, fetch emails endpoint
            if (!email) {
                const emailsRes = await fetch('https://api.github.com/user/emails', {
                    headers: { Authorization: `token ${access_token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'ecme-lite' },
                });
                if (emailsRes.ok) {
                    const emails = await emailsRes.json();
                    const primary = Array.isArray(emails) && emails.find((e) => e.primary && e.verified);
                    const anyVerified = Array.isArray(emails) && emails.find((e) => e.verified);
                    email = primary?.email || anyVerified?.email || null;
                }
            }

            if (!email) return res.status(401).json({ message: 'Could not determine GitHub account email' });

            let user = await getUserByEmailDb(email).catch(() => null);
            if (!user) {
                user = await createUserDb({ userName: name, email, password: '', authority: ['client'] });
            }

            return res.status(200).json({ token: signJwt({ sub: user.userId, email: user.email, authority: user.authority || ['client'] }, getJwtSecret(), getJwtExpiry()), user: sanitizeUser(user) });
        } catch (err) {
            console.error('GitHub sign-in failed:', err && err.stack ? err.stack : err);
            return res.status(500).json({ message: 'GitHub sign-in failed' });
        }
    }

    // Method not allowed / not found
    return res.status(404).json({ message: 'Not found' });
}
