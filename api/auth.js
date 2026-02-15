import {
    DEFAULT_USERS,
    createUserDb,
    getUserByEmailDb,
} from '../backend/src/utils/db.js';
import { hashPassword, signJwt, verifyPassword } from '../backend/src/utils/security.js';

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
    if (req.method === 'POST' && req.url.endsWith('/sign-in')) {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        try {
            const user = await getUserByEmailDb(email);
            const isPasswordValid = user
                ? (await verifyPassword(password, user.password)) || user.password === password
                : false;
            if (!user || !isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            return res.json({
                token: signJwt(
                    {
                        sub: user.userId,
                        email: user.email,
                        authority: user.authority || ['client'],
                    },
                    getJwtSecret(),
                    getJwtExpiry(),
                ),
                user: sanitizeUser(user),
            });
        } catch (error) {
            const fallbackUser = findUserFallback(email);
            if (fallbackUser) {
                const fallbackMatch =
                    (await verifyPassword(password, fallbackUser.password)) ||
                    fallbackUser.password === password;
                if (fallbackMatch) {
                    return res.json({
                        token: signJwt(
                            {
                                sub: fallbackUser.userId,
                                email: fallbackUser.email,
                                authority: fallbackUser.authority || ['client'],
                            },
                            getJwtSecret(),
                            getJwtExpiry(),
                        ),
                        user: sanitizeUser(fallbackUser),
                    });
                }
            }
            console.error('Sign-in failed:', error);
            return res.status(500).json({ message: 'Sign-in failed' });
        }
    }

    if (req.method === 'POST' && req.url.endsWith('/sign-up')) {
        const { userName, email, password } = req.body || {};
        if (!userName || !email || !password) {
            return res.status(400).json({ message: 'User name, email, and password are required' });
        }
        try {
            const existing = await getUserByEmailDb(email);
            if (existing) {
                return res.status(409).json({ message: 'User already exists' });
            }
            const created = await createUserDb({
                userName,
                email,
                password: await hashPassword(password),
                authority: ['client'],
            });
            return res.json({
                token: signJwt(
                    {
                        sub: created.userId,
                        email: created.email,
                        authority: created.authority || ['client'],
                    },
                    getJwtSecret(),
                    getJwtExpiry(),
                ),
                user: sanitizeUser(created),
            });
        } catch (error) {
            console.error('Sign-up failed:', error);
            return res.status(500).json({ message: 'Sign-up failed' });
        }
    }

    return res.status(404).json({ message: 'Not found' });
}
