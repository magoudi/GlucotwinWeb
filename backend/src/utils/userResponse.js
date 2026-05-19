function initialsForName(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'GT';
}

function usernameForEmail(email = '') {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function safeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    initials: user.initials || initialsForName(user.fullName),
    phone: user.phone || '',
    bio: user.bio || '',
    subtitle: user.subtitle || 'GlucoTwin patient profile',
    role: user.role,
    dateOfBirth: user.dateOfBirth || null,
    diabetesType: user.diabetesType || '',
    managementType: user.managementType,
    glucoseUnit: user.glucoseUnit,
    targetGlucoseMin: user.targetGlucoseMin,
    targetGlucoseMax: user.targetGlucoseMax,
    carbRatio: user.carbRatio,
    correctionFactor: user.correctionFactor,
    insulinSensitivity: user.insulinSensitivity,
    basalProfile: user.basalProfile || [],
    featureFlags: user.featureFlags instanceof Map ? Object.fromEntries(user.featureFlags) : (user.featureFlags || {}),
    isSubscribed: user.isSubscribed || false,
    subscriptionStatus: user.subscriptionStatus || 'none',
    subscriptionPlan: user.subscriptionPlan || null,
    subscriptionBillingPeriod: user.subscriptionBillingPeriod || null,
    subscriptionEndDate: user.subscriptionEndDate || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  initialsForName,
  safeUser,
  usernameForEmail,
};
