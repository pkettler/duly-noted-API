import { UserInputError } from 'apollo-server';
import cuid from 'cuid';
import { getNotes } from './notes.js';
import { saveNotes } from './notes.js';

export default {
  Mutation: {
    async createNote(_, args) {
      const savedNotes = await getNotes();

      const { note } = args;

      const newNote = { ...note };

      if (!newNote.id) {
        newNote.id = cuid();
      }

      if (!newNote.createdAt) {
        const now = new Date();
        newNote.createdAt = now.toISOString();
      }

      if (!newNote.updatedAt) {
        const now = new Date();
        newNote.updatedAt = now.toISOString();
      }

      if (typeof newNote.isArchived !== 'boolean') {
        newNote.isArchived = false;
      }

      savedNotes.push(newNote);

      await saveNotes(savedNotes);

      return newNote;
    },

    //Update Note mutation

    async updateNote(_, args) {
      const { note, id } = args;

      const savedNotes = await getNotes();

      const noteUpdate = savedNotes.find((savedNote) => savedNote.id === id);

      if (!noteUpdate) {
        throw new UserInputError('Invalid argument value');
      }

      const updateNote = { ...note };

      if (
        typeof updateNote.isArchived === 'boolean' ||
        typeof updateNote.text === 'string'
      ) {
        const now = new Date();
        updateNote.updatedAt = now.toISOString();
      } else {
        return noteUpdate;
      }

      let updatedNote;
      for (const savedNote of savedNotes) {
        if (savedNote.id === id) {
          Object.assign(savedNote, updateNote);
          updatedNote = savedNote;
          break;
        }
      }

      await saveNotes(savedNotes);
      return updatedNote;
    },

    //Delete Note mutation

    async deleteNote(_, args) {
      let savedNotes = await getNotes();

      const { id } = args;

      const noteIndex = savedNotes.findIndex(
        (savedNote) => savedNote.id === id
      );

      if (noteIndex < 0) {
        throw new Error('Id could not be found');
      }

      const [removedNote] = savedNotes.splice(noteIndex, 1);

      await saveNotes(savedNotes);

      return removedNote;
    },
  },

  Query: {
    async note(_, args) {
      const savedNotes = await getNotes();

      return savedNotes.find((note) => note.id === args.id);
    },
    async notes(_, args) {
      const savedNotes = await getNotes();

      const { includeArchived } = args;
      if (includeArchived) {
        return savedNotes;
      }
      return savedNotes.filter((note) => !note.isArchived);
    },
  },
};
