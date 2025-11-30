'use client';

import { EditorRoot, EditorContent, type JSONContent } from 'novel';
import { useState, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Link, Image, Minus, Type, CheckSquare, Calendar, Hash, AtSign, Palette } from 'lucide-react';
import { defaultExtensions } from '@/components/extensions';

interface NovelEditorProps {
  defaultValue?: string;
  onUpdate?: (html: string) => void;
}

export default function NovelEditor({ defaultValue = '', onUpdate }: NovelEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  
  // Update editor content when defaultValue changes
  useEffect(() => {
    if (editor && defaultValue) {
      editor.commands.setContent(defaultValue);
    }
  }, [editor, defaultValue]);

  const formatButtons = [
    // Text Formatting
    {
      icon: <Type className="h-4 w-4" />,
      label: 'Clear Formatting',
      action: () => editor?.chain().focus().clearNodes().unsetAllMarks().run(),
      isActive: () => false
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: 'Heading 1',
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor?.isActive('heading', { level: 1 })
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: 'Heading 2', 
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor?.isActive('heading', { level: 2 })
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: 'Heading 3',
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor?.isActive('heading', { level: 3 })
    },
    // Divider
    { divider: true },
    // Text Styles
    {
      icon: <Bold className="h-4 w-4" />,
      label: 'Bold',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold')
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: 'Italic',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic')
    },

    {
      icon: <Strikethrough className="h-4 w-4" />,
      label: 'Strikethrough',
      action: () => editor?.chain().focus().toggleStrike().run(),
      isActive: () => editor?.isActive('strike')
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: 'Inline Code',
      action: () => editor?.chain().focus().toggleCode().run(),
      isActive: () => editor?.isActive('code')
    },
    // Divider
    { divider: true },
    // Lists & Blocks
    {
      icon: <List className="h-4 w-4" />,
      label: 'Bullet List',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList')
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: 'Numbered List',
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: () => editor?.isActive('orderedList')
    },

    {
      icon: <Quote className="h-4 w-4" />,
      label: 'Quote',
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editor?.isActive('blockquote')
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: 'Code Block',
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor?.isActive('codeBlock')
    },
    // Divider
    { divider: true },
    // Alignment

    // Divider
    { divider: true },
    // Media & Links

    {
      icon: <Minus className="h-4 w-4" />,
      label: 'Divider',
      action: () => editor?.chain().focus().setHorizontalRule().run(),
      isActive: () => false
    }
  ];

  return (
    <div className="flex gap-4 min-h-[400px] w-full">
      {/* Toolbar */}
      <div className="flex flex-col gap-1 p-3 border-r border-gray-200 rounded-l-lg bg-gray-50 min-w-[60px]">
        {formatButtons.map((button, index) => {
          if (button.divider) {
            return <div key={index} className="h-px bg-gray-300 my-1" />;
          }
          return (
            <button
              key={index}
              onClick={button.action}
              className={`p-2 rounded-md transition-colors ${
                button.isActive?.()
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={button.label}
            >
              {button.icon}
            </button>
          );
        })}
      </div>
      
      {/* Editor */}
      <div className="flex-1">
        <EditorRoot>
          <EditorContent
            className="prose prose-lg max-w-none min-h-[600px] focus:outline-none p-20"
            extensions={defaultExtensions}
            immediatelyRender={false}
            content={defaultValue}
            onCreate={({ editor }) => setEditor(editor)}
            onUpdate={({ editor }) => {
              const html = editor?.getHTML() || '';
              if (onUpdate) {
                onUpdate(html);
              }
            }}
            editorProps={{
              attributes: {
                class: 'prose prose-lg max-w-none min-h-[400px] focus:outline-none',
                spellcheck: 'true',
              },
              handleKeyDown: (view, event) => {
                // Ensure spacebar works normally
                if (event.key === ' ') {
                  return false; // Let the default behavior happen
                }
                return false;
              },
            }}
          />
        </EditorRoot>
      </div>
    </div>
  );
}
