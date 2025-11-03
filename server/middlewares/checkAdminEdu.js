export const isEducatorOrAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'educator' || role === 'super_admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Only educators or admins allowed' });
  }
};
