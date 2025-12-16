'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Node } from '@tiptap/core';
import { useCallback, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Palette,
  Highlighter,
  FileText,
} from 'lucide-react';

// Custom Page Break extension
const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },
  renderHTML() {
    return ['div', { 'data-page-break': 'true', class: 'page-break' }, '--- Page Break ---'];
  },
  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent('<div data-page-break="true" class="page-break">--- Page Break ---</div>');
      },
    };
  },
});

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function TipTapEditor({ content, onChange, placeholder, className }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      PageBreak,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg cursor-pointer',
        },
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: element => element.getAttribute('width'),
              renderHTML: attributes => {
                if (!attributes.width) return {};
                return { width: attributes.width, style: `width: ${attributes.width}; height: auto;` };
              },
            },
          };
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Handle image selection for resizing
      const { selection } = editor.state;
      const node = selection.$from.node();
      if (node && node.type.name === 'image') {
        // Image is selected
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6 w-full',
        style: 'line-height: 1.8; font-size: 16px; max-width: none;',
      },
    },
  });

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, []);

  const handleImageUpload = useCallback(async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      try {
        const imageUrl = await uploadImage(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        alert('Failed to upload image. Please try again.');
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor, uploadImage]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <style jsx>{`
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .ProseMirror img:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        .ProseMirror .page-break {
          margin: 20px 0;
          padding: 10px;
          border: 2px dashed #e5e7eb;
          border-radius: 8px;
          text-align: center;
          color: #6b7280;
          background-color: #f9fafb;
          font-weight: 500;
          cursor: pointer;
        }
        .ProseMirror .page-break:hover {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
      `}</style>
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Media & Links */}
        <button
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          onClick={handleImageUpload}
          className="p-2 rounded hover:bg-gray-200"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().setPageBreak().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Page Break"
        >
          <FileText size={16} />
        </button>
        
        <button
          onClick={() => {
            const { selection } = editor.state;
            const { $from } = selection;
            const node = $from.node();
            
            // Check if we have an image selected
            if (selection.node && selection.node.type.name === 'image') {
              const width = prompt('Enter width (e.g., 300px, 50%):');
              if (width) {
                const attrs = { ...selection.node.attrs, width };
                editor.chain().focus().setImage(attrs).run();
              }
            } else {
              alert('Please select an image first');
            }
          }}
          className="p-2 rounded hover:bg-gray-200 text-xs"
          title="Resize Selected Image"
        >
          📏
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Color & Highlight */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 rounded border-0 cursor-pointer"
          title="Text Color"
        />
        <button
          onClick={() => {
            const color = window.prompt('Enter highlight color (hex):');
            if (color) {
              editor.chain().focus().toggleHighlight({ color }).run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-300' : ''}`}
          title="Highlight"
        >
          <Highlighter size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor */}
      <div className="min-h-[400px] bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}