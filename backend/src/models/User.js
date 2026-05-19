const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { initialsForName, usernameForEmail } = require('../utils/userResponse');

const basalBlockSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, 'startTime must use HH:mm format'],
    },
    rate: {
      type: Number,
      required: true,
      min: [0, 'Basal rate cannot be negative'],
      max: [10, 'Basal rate is too high for this prototype'],
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [120, 'Full name is too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email'],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [80, 'Username is too long'],
    },
    initials: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    subtitle: {
      type: String,
      trim: true,
      default: 'GlucoTwin patient profile',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: [40, 'Phone number is too long'],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Bio is too long'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    diabetesType: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    managementType: {
      type: String,
      enum: ['pump', 'injections', 'unknown'],
      default: 'unknown',
    },
    glucoseUnit: {
      type: String,
      enum: ['mmol/L', 'mg/dL'],
      default: 'mg/dL',
    },
    targetGlucoseMin: {
      type: Number,
      default: 80,
      min: 40,
      max: 250,
    },
    targetGlucoseMax: {
      type: Number,
      default: 150,
      min: 60,
      max: 400,
    },
    carbRatio: {
      type: Number,
      default: 11,
      min: 1,
      max: 80,
    },
    correctionFactor: {
      type: Number,
      default: 42,
      min: 1,
      max: 200,
    },
    insulinSensitivity: {
      type: Number,
      default: 42,
      min: 1,
      max: 200,
    },
    basalProfile: {
      type: [basalBlockSchema],
      default: [
        { startTime: '00:00', rate: 0.62 },
        { startTime: '04:00', rate: 0.78 },
        { startTime: '08:00', rate: 0.72 },
        { startTime: '12:00', rate: 0.66 },
        { startTime: '18:00', rate: 0.82 },
        { startTime: '22:00', rate: 0.68 },
      ],
    },
    featureFlags: {
      type: Map,
      of: Boolean,
      default: () => new Map([
        ['beta_food_vision', false],
        ['advanced_what_if', false]
      ]),
    },
    specialty: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Specialty is too long'],
    },
    clinicName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Clinic name is too long'],
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'License number is too long'],
    },
    clinicalStatus: {
      type: String,
      default: 'Needs Review',
    },
    // --- Subscription Fields ---
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'past_due', 'cancelled', 'expired'],
      default: 'none',
    },
    subscriptionPlan: {
      type: String,
      enum: ['standard', 'premium', 'vip', null],
      default: null,
    },
    subscriptionBillingPeriod: {
      type: String,
      enum: ['monthly', 'six_months', 'yearly', null],
      default: null,
    },
    subscriptionStartDate: {
      type: Date,
      default: null,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    passwordResetCodeHash: {
      type: String,
      default: null,
    },
    passwordResetCodeExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetCodeAttempts: {
      type: Number,
      default: 0,
    },
    passwordResetCodeLastSentAt: {
      type: Date,
      default: null,
    },
    passwordResetVerifiedAt: {
      type: Date,
      default: null,
    },
    passwordResetSessionTokenHash: {
      type: String,
      default: null,
    },
    passwordResetSessionExpiresAt: {
      type: Date,
      default: null,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

userSchema.pre('validate', function setDerivedFields() {
  if (!this.username && this.email) {
    this.username = usernameForEmail(this.email);
  }

  if (!this.initials && this.fullName) {
    this.initials = initialsForName(this.fullName);
  }

  if (this.targetGlucoseMin >= this.targetGlucoseMax) {
    this.invalidate('targetGlucoseMax', 'Target glucose max must be greater than target min');
  }

});

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
