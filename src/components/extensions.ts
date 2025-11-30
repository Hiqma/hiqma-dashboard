import { StarterKit } from '@tiptap/starter-kit';

export const defaultExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    listItem: {
      keepMarks: true,
      keepAttributes: false,
    },
    blockquote: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: {
      keepMarks: false,
      keepAttributes: false,
    },
  }),
];
