// backend/middleware/auth.js
// Sprint 1 – Authentication & RBAC middleware

/**
 * requireAuth
 * Rejects requests with no active session.
 * Attach to any route that needs a logged-in user.
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Unauthorized – please log in' });
  }
  next();
}

/**
 * requireRole(...roles)
 * Factory that returns middleware allowing only the specified roles.
 * Always use AFTER requireAuth.
 *
 * Usage:
 *   router.get('/admin-only', requireAuth, requireRole('Admin'), handler)
 *   router.get('/any-officer', requireAuth, requireRole('Admin','VO'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.session.user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden – requires one of: ${roles.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
