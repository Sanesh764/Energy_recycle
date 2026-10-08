/**
 * Role Authorization Middleware Factory
 * Enforces role checks on routes per SPEC.md Section 3.
 *
 * @param {...string} allowedRoles ('citizen', 'collector', 'admin')
 * @returns {Function} Express middleware
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  requireRole
};
