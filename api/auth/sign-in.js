import handler from '../auth.js';

export default function (req, res) {
    // Ajustar la URL para que el handler central identifique la ruta
    req.url = '/sign-in';
    return handler(req, res);
}
