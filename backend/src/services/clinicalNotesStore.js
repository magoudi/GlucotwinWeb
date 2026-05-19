const crypto = require('crypto');
const { useInMemoryDb } = require('../config/env');
const ClinicalNote = require('../models/ClinicalNote');

// Map of patientId -> Array of notes
const notesByPatient = new Map();

async function listNotesForPatient(patientId) {
  if (!useInMemoryDb) {
    const notes = await ClinicalNote.find({ patientId }).sort({ createdAt: -1 });
    return notes.map(n => ({
      id: n._id.toString(),
      patientId: n.patientId.toString(),
      doctorId: n.doctorId.toString(),
      content: n.content,
      createdAt: n.createdAt,
    }));
  }
  return notesByPatient.get(patientId) || [];
}

async function addNote(patientId, doctorId, content) {
  if (!useInMemoryDb) {
    const note = new ClinicalNote({ patientId, doctorId, content });
    await note.save();
    return {
      id: note._id.toString(),
      patientId: note.patientId.toString(),
      doctorId: note.doctorId.toString(),
      content: note.content,
      createdAt: note.createdAt,
    };
  }

  const note = {
    id: crypto.randomUUID(),
    patientId,
    doctorId,
    content,
    createdAt: new Date().toISOString(),
  };

  const notes = await listNotesForPatient(patientId);
  notes.push(note);
  notesByPatient.set(patientId, notes);

  return note;
}

async function deleteNote(patientId, noteId) {
  if (!useInMemoryDb) {
    const result = await ClinicalNote.deleteOne({ _id: noteId, patientId });
    return result.deletedCount > 0;
  }

  const notes = await listNotesForPatient(patientId);
  const updatedNotes = notes.filter((n) => n.id !== noteId);
  notesByPatient.set(patientId, updatedNotes);
  return updatedNotes.length !== notes.length;
}

module.exports = {
  listNotesForPatient,
  addNote,
  deleteNote,
};
