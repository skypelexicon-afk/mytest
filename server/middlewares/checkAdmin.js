export const isAdmin = (req, res, next) => {
    const role = req.user?.role;
    console.log(`User role: ${role}`);

    if (role === 'super_admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Only admins allowed' });
    }
};
