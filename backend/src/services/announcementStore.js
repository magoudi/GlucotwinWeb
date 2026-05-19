const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const Announcement = require('../models/Announcement');

const announcements = new Map();

// Seed with an example announcement
announcements.set('welcome', {
  id: 'welcome',
  title: 'Welcome to GlucoTwin Beta',
  message: 'We are currently testing new predictive models. Please report any issues you experience.',
  type: 'info', // 'info', 'warning', 'success', 'error'
  active: true,
  createdAt: new Date().toISOString(),
});

function mapAnnouncement(record) {
  return {
    id: record._id ? record._id.toString() : record.id,
    title: record.title,
    message: record.message,
    type: record.severity || record.type || 'info',
    active: record.active,
    createdAt: record.createdAt,
    audience: record.audience || 'all',
    startAt: record.startAt || record.createdAt,
    endAt: record.endAt || null,
  };
}

async function listAnnouncements() {
  if (!useInMemoryDb) {
    const records = await Announcement.find().sort({ createdAt: -1 });
    return records.map(mapAnnouncement);
  }

  return Array.from(announcements.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getActiveAnnouncements() {
  if (!useInMemoryDb) {
    const now = new Date();
    const records = await Announcement.find({
      active: true,
      startAt: { $lte: now },
      $or: [
        { endAt: null },
        { endAt: { $exists: false } },
        { endAt: { $gte: now } },
      ],
    }).sort({ createdAt: -1 });

    return records.map(mapAnnouncement);
  }

  return (await listAnnouncements()).filter((a) => a.active);
}

async function createAnnouncement(data) {
  if (!useInMemoryDb) {
    const record = new Announcement({
      title: data.title,
      message: data.message,
      severity: data.type || data.severity || 'info',
      active: data.active !== undefined ? data.active : true,
      audience: data.audience || 'all',
      startAt: data.startAt || new Date(),
      endAt: data.endAt || null,
    });
    await record.save();
    return mapAnnouncement(record);
  }

  const id = crypto.randomUUID();
  const announcement = {
    id,
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    active: data.active !== undefined ? data.active : true,
    createdAt: new Date().toISOString(),
  };
  announcements.set(id, announcement);
  return announcement;
}

async function updateAnnouncement(id, data) {
  if (!useInMemoryDb) {
    const record = await Announcement.findByIdAndUpdate(
      id,
      {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.message !== undefined ? { message: data.message } : {}),
        ...(data.type !== undefined || data.severity !== undefined ? { severity: data.type || data.severity } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.audience !== undefined ? { audience: data.audience } : {}),
        ...(data.startAt !== undefined ? { startAt: data.startAt } : {}),
        ...(data.endAt !== undefined ? { endAt: data.endAt } : {}),
      },
      { new: true },
    );

    return record ? mapAnnouncement(record) : null;
  }

  if (!announcements.has(id)) return null;
  const existing = announcements.get(id);
  const updated = { ...existing, ...data };
  announcements.set(id, updated);
  return updated;
}

async function deleteAnnouncement(id) {
  if (!useInMemoryDb) {
    const result = await Announcement.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  return announcements.delete(id);
}

module.exports = {
  listAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
