import { UserInputError } from 'apollo-server';
import cuid from 'cuid';

const savedNotes = [];

export default {
  Mutation: {
    createNote(_, args) {
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

      return newNote;
    },

    //Update Note mutation

    updateNote(_, args) {
      const { note, id } = args;

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

      return updatedNote;
    },

    //Delete Note mutation

    deleteNote(_, args) {
      const { id } = args;

      const noteIndex = savedNotes.findIndex(
        (savedNote) => savedNote.id === id
      );

      if (noteIndex < 0) {
        throw new Error('Id could not be found');
      }

      const [removedNote] = savedNotes.splice(noteIndex, 1);

      return removedNote;
    },
  },

  Query: {
    note(_, args) {
      return savedNotes.find((note) => note.id === args.id);
    },
    notes(_, args) {
      const { includeArchived } = args;
      if (includeArchived) {
        return savedNotes;
      }
      return savedNotes.filter((note) => !note.isArchived);
    },
  },
};
