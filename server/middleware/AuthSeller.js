import jwt from 'jsonwebtoken';

const AuthSeller = (req, res, next) => {
    const token = req.cookies.sellerToken; // <--- make sure you're using the correct cookie name

    if (!token) {
        return res.json({ success: false, message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // <--- FIXED this line
        if (decoded && decoded.id) {
            req.seller = { id: decoded.id };
            return next();
        }
        return res.json({ success: false, message: 'Not authenticated.' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export default AuthSeller;