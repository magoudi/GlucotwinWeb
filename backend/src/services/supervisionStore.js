const DoctorPatientRequest = require('../models/DoctorPatientRequest');
const User = require('../models/User');
const { useInMemoryDb } = require('../config/env');
const AppError = require('../utils/AppError');

// In-memory fallback
const memoryRequests = [];

function generateId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function listDoctors() {
  if (!useInMemoryDb) {
    return User.find({ role: 'doctor', isActive: true }).select('fullName email specialty clinicName licenseNumber');
  }
  // Use userStore's in-memory users
  const userStore = require('./userStore');
  const allUsers = await userStore.listAllUsers();
  return allUsers
    .filter(u => u.role === 'doctor' && u.isActive !== false)
    .map(u => ({
      _id: u._id,
      id: u._id.toString(),
      fullName: u.fullName,
      email: u.email,
      specialty: u.specialty || '',
      clinicName: u.clinicName || '',
      licenseNumber: u.licenseNumber || '',
    }));
}

async function createRequest(patientId, doctorId, message = '') {
  // Check for existing pending request
  if (!useInMemoryDb) {
    const existing = await DoctorPatientRequest.findOne({
      patientId,
      doctorId,
      status: 'pending',
    });
    if (existing) {
      throw new AppError('You already have a pending request to this doctor.', 400, 'DUPLICATE_REQUEST');
    }

    const request = new DoctorPatientRequest({
      patientId,
      doctorId,
      message,
      status: 'pending',
      requestedAt: new Date(),
    });
    await request.save();
    return request;
  }

  // In-memory
  const existing = memoryRequests.find(
    r => r.patientId === patientId && r.doctorId === doctorId && r.status === 'pending'
  );
  if (existing) {
    throw new AppError('You already have a pending request to this doctor.', 400, 'DUPLICATE_REQUEST');
  }

  const request = {
    _id: generateId(),
    id: generateId(),
    patientId,
    doctorId,
    message,
    responseMessage: '',
    status: 'pending',
    requestedAt: new Date(),
    respondedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  request.id = request._id;
  memoryRequests.push(request);
  return request;
}

async function getPatientRequests(patientId) {
  if (!useInMemoryDb) {
    return DoctorPatientRequest.find({ patientId })
      .populate('doctorId', 'fullName email specialty clinicName')
      .sort({ createdAt: -1 });
  }

  const userStore = require('./userStore');
  const requests = memoryRequests.filter(r => r.patientId === patientId);
  // Enrich with doctor info
  return Promise.all(requests.map(async r => {
    const doctor = await userStore.findById(r.doctorId);
    return {
      ...r,
      doctor: doctor ? {
        _id: doctor._id,
        id: doctor._id.toString(),
        fullName: doctor.fullName,
        email: doctor.email,
        specialty: doctor.specialty || '',
        clinicName: doctor.clinicName || '',
      } : null,
    };
  }));
}

async function getDoctorRequests(doctorId) {
  if (!useInMemoryDb) {
    return DoctorPatientRequest.find({ doctorId, status: 'pending' })
      .populate('patientId', 'fullName email diabetesType managementType')
      .sort({ createdAt: -1 });
  }

  const userStore = require('./userStore');
  const requests = memoryRequests.filter(r => r.doctorId === doctorId && r.status === 'pending');
  return Promise.all(requests.map(async r => {
    const patient = await userStore.findById(r.patientId);
    return {
      ...r,
      patient: patient ? {
        _id: patient._id,
        id: patient._id.toString(),
        fullName: patient.fullName,
        email: patient.email,
        diabetesType: patient.diabetesType || '',
        managementType: patient.managementType || '',
      } : null,
    };
  }));
}

async function respondToRequest(requestId, doctorId, decision, responseMessage = '') {
  if (!useInMemoryDb) {
    const request = await DoctorPatientRequest.findById(requestId);
    if (!request) {
      throw new AppError('Request not found.', 404, 'NOT_FOUND');
    }
    if (request.doctorId.toString() !== doctorId) {
      throw new AppError('This request does not belong to you.', 403, 'FORBIDDEN');
    }
    if (request.status !== 'pending') {
      throw new AppError('This request has already been handled.', 400, 'REQUEST_ALREADY_HANDLED');
    }

    request.status = decision;
    request.responseMessage = responseMessage;
    request.respondedAt = new Date();
    await request.save();

    if (decision === 'accepted') {
      await User.findByIdAndUpdate(request.patientId, { assignedDoctor: doctorId });
    }

    return request;
  }

  // In-memory
  const request = memoryRequests.find(r => r._id === requestId || r.id === requestId);
  if (!request) {
    throw new AppError('Request not found.', 404, 'NOT_FOUND');
  }
  if (request.doctorId !== doctorId) {
    throw new AppError('This request does not belong to you.', 403, 'FORBIDDEN');
  }
  if (request.status !== 'pending') {
    throw new AppError('This request has already been handled.', 400, 'REQUEST_ALREADY_HANDLED');
  }

  request.status = decision;
  request.responseMessage = responseMessage;
  request.respondedAt = new Date();
  request.updatedAt = new Date();

  if (decision === 'accepted') {
    const userStore = require('./userStore');
    const patient = await userStore.findById(request.patientId);
    if (patient) {
      patient.assignedDoctor = doctorId;
      await userStore.saveUser(patient);
    }
  }

  return request;
}

module.exports = {
  listDoctors,
  createRequest,
  getPatientRequests,
  getDoctorRequests,
  respondToRequest,
};
