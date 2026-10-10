const { CognitoJwtVerifier } = require('aws-jwt-verify');
const env = require('../config/env');
const User = require('../models/User');

const VALID_ROLES = Object.freeze(['citizen', 'collector', 'admin']);

/**
 * Isolated, controlled demo accounts for local development and demonstration only.
 * Strictly non-production: inaccessible unless ALLOW_DEV_DEMO_AUTH=true and NODE_ENV !== 'production'.
 */
const DEV_DEMO_ACCOUNTS = Object.freeze({
  'ewaste-demo-citizen-token': {
    cognitoSub: 'dev-demo-citizen-01',
    name: 'Demo Citizen',
    email: 'citizen@example.org',
    role: 'citizen',
    servicePincodes: []
  },
  'ewaste-demo-collector-token': {
    cognitoSub: 'dev-demo-collector-01',
    name: 'Demo Collector',
    email: 'collector@example.org',
    role: 'collector',
    servicePincodes: ['110001', '110002']
  },
  'ewaste-demo-admin-token': {
    cognitoSub: 'dev-demo-admin-01',
    name: 'Demo Administrator',
    email: 'admin@example.org',
    role: 'admin',
    servicePincodes: []
  }
});

let jwtVerifier = null;

/**
 * Initializes or returns the Cognito JWT verifier instance.
 */
function getVerifier() {
  if (!jwtVerifier && env.COGNITO_USER_POOL_ID && env.COGNITO_CLIENT_ID) {
    // tokenUse: null allows verifying both ID and Access tokens as specified in SPEC.md Section 8
    jwtVerifier = CognitoJwtVerifier.create({
      userPoolId: env.COGNITO_USER_POOL_ID,
      clientId: env.COGNITO_CLIENT_ID,
      tokenUse: null
    });
  }
  return jwtVerifier;
}

/**
 * For testing purposes: allows injecting a custom or mock verifier.
 * @param {object|null} verifier
 */
function setVerifier(verifier) {
  jwtVerifier = verifier;
}

/**
 * Map Cognito groups claim to application role.
 * Mapping rules per SPEC.md Section 3 and instructions:
 * - citizen -> citizen
 * - collector -> collector
 * - admin -> admin
 * - no group -> citizen
 * - any unknown group -> throws an error (rejected)
 *
 * @param {string[]|string|undefined} groupsClaim
 * @returns {string} 'citizen' | 'collector' | 'admin'
 */
function mapCognitoGroupsToRole(groupsClaim) {
  if (!groupsClaim || (Array.isArray(groupsClaim) && groupsClaim.length === 0)) {
    // SPEC.md Section 3: "A user with no group is treated as citizen."
    return 'citizen';
  }

  const groups = Array.isArray(groupsClaim) ? groupsClaim : [groupsClaim];

  // Check for unknown/unapproved groups
  for (const group of groups) {
    if (!VALID_ROLES.includes(group)) {
      const err = new Error(`Unauthorized: unknown Cognito group '${group}'`);
      err.statusCode = 403;
      throw err;
    }
  }

  // Priority mapping among valid roles
  if (groups.includes('admin')) {
    return 'admin';
  }
  if (groups.includes('collector')) {
    return 'collector';
  }
  if (groups.includes('citizen')) {
    return 'citizen';
  }

  return 'citizen';
}

/**
 * Authentication Middleware
 * Verifies Cognito JWT, maps roles, and synchronizes user in database.
 * Never logs raw tokens or sensitive user data.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header is missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return res.status(401).json({ error: 'Authorization header is missing or malformed' });
    }

    // Controlled development demo authentication provider:
    // Strictly opt-in via ALLOW_DEV_DEMO_AUTH and impossible in production (NODE_ENV !== 'production').
    if (env.NODE_ENV !== 'production' && env.ALLOW_DEV_DEMO_AUTH === true && DEV_DEMO_ACCOUNTS[token]) {
      const demoAccount = DEV_DEMO_ACCOUNTS[token];
      let user = await User.findOne({ cognitoSub: demoAccount.cognitoSub });
      if (!user) {
        user = await User.create({
          cognitoSub: demoAccount.cognitoSub,
          name: demoAccount.name,
          email: demoAccount.email,
          role: demoAccount.role,
          servicePincodes: demoAccount.servicePincodes
        });
      } else {
        if (
          user.role !== demoAccount.role ||
          (demoAccount.role === 'collector' && (!user.servicePincodes || user.servicePincodes.length === 0))
        ) {
          user.role = demoAccount.role;
          user.servicePincodes = demoAccount.servicePincodes;
          if (typeof user.save === 'function') {
            await user.save();
          }
        }
      }
      req.user = user;
      req.auth = {
        sub: user.cognitoSub,
        role: user.role
      };
      return next();
    }

    const verifier = getVerifier();
    if (!verifier) {
      return res.status(500).json({ error: 'Cognito authentication verifier is not configured' });
    }

    let payload;
    try {
      payload = await verifier.verify(token);
    } catch (verifyError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token claims' });
    }

    const cognitoSub = payload.sub;
    const groupsClaim = payload['cognito:groups'];
    const mappedRole = mapCognitoGroupsToRole(groupsClaim);

    // Synchronize user in database
    // SPEC.md Section 7: "Create the user document on first authenticated request if it does not exist."
    let user = await User.findOne({ cognitoSub });

    if (!user) {
      const displayName =
        payload.name ||
        payload['cognito:username'] ||
        payload.email ||
        payload.username ||
        'Citizen';

      user = await User.create({
        cognitoSub,
        name: displayName,
        role: mappedRole
      });
    } else {
      // User synchronization must not blindly overwrite an existing privileged database role
      if (mappedRole !== 'citizen' && user.role !== mappedRole) {
        user.role = mappedRole;
        if (typeof user.save === 'function') {
          await user.save();
        }
      }
    }

    // Attach user to req.user for downstream middleware and route handlers
    req.user = user;
    req.auth = {
      sub: cognitoSub,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
  }
}

module.exports = {
  authenticate,
  mapCognitoGroupsToRole,
  getVerifier,
  setVerifier,
  VALID_ROLES,
  DEV_DEMO_ACCOUNTS
};
