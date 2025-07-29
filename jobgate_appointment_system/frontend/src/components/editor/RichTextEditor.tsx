import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Box,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  FormHelperText,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Undo,
  Redo,
} from '@mui/icons-material';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  error = false,
  helperText,
  disabled = false,
  minHeight = 150,
  maxHeight = 400,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editable: !disabled,
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  // RichTextEditor.tsx
const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}> = ({ onClick, isActive = false, disabled = false, tooltip, children }) => (
  <Tooltip title={tooltip}>
    {/* wrap with span so Tooltip always has a functioning child */}
    <span>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        size="small"
        sx={{
          color: isActive ? 'primary.main' : 'text.secondary',
          bgcolor: isActive ? 'primary.50' : 'transparent',
          '&:hover': {
            bgcolor: isActive ? 'primary.100' : 'action.hover',
          },
        }}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          border: error ? '2px solid' : '1px solid',
          borderColor: error ? 'error.main' : 'divider',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: 1,
            bgcolor: 'grey.50',
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
          }}
        >
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
            tooltip="Bold"
          >
            <FormatBold />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
            tooltip="Italic"
          >
            <FormatItalic />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={disabled}
            tooltip="Inline Code"
          >
            <Code />
          </ToolbarButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={disabled}
            tooltip="Bullet List"
          >
            <FormatListBulleted />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
            tooltip="Numbered List"
          >
            <FormatListNumbered />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={disabled}
            tooltip="Quote"
          >
            <FormatQuote />
          </ToolbarButton>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* History */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            tooltip="Undo"
          >
            <Undo />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            tooltip="Redo"
          >
            <Redo />
          </ToolbarButton>
        </Box>

        {/* Editor Content */}
        <Box
          sx={{
            minHeight,
            maxHeight,
            overflow: 'auto',
            p: 2,
            '& .ProseMirror': {
              outline: 'none',
              minHeight: minHeight - 32,
              '& p.is-editor-empty:first-of-type::before': {
                content: `"${placeholder}"`,
                float: 'left',
                color: 'text.secondary',
                pointerEvents: 'none',
                height: 0,
              },
              '& h1': {
                fontSize: '2rem',
                fontWeight: 'bold',
                marginTop: '1rem',
                marginBottom: '0.5rem',
              },
              '& h2': {
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginTop: '1rem',
                marginBottom: '0.5rem',
              },
              '& h3': {
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginTop: '1rem',
                marginBottom: '0.5rem',
              },
              '& p': {
                marginBottom: '0.5rem',
              },
              '& ul, & ol': {
                paddingLeft: '1.5rem',
                marginBottom: '0.5rem',
              },
              '& li': {
                marginBottom: '0.25rem',
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                paddingLeft: '1rem',
                marginLeft: 0,
                marginRight: 0,
                fontStyle: 'italic',
                color: 'text.secondary',
              },
              '& code': {
                backgroundColor: 'grey.100',
                padding: '0.125rem 0.25rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              },
              '& pre': {
                backgroundColor: 'grey.100',
                padding: '1rem',
                borderRadius: '0.5rem',
                overflow: 'auto',
                '& code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                },
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>

      {/* Helper Text */}
      {helperText && (
        <FormHelperText error={error} sx={{ mt: 1 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

// Simplified version for basic notes
export const SimpleTextEditor: React.FC<RichTextEditorProps> = (props) => (
  <RichTextEditor
    {...props}
    minHeight={100}
    maxHeight={200}
  />
);

// Read-only version for displaying content
export const ReadOnlyEditor: React.FC<{
  content: string;
  maxHeight?: number;
}> = ({ content, maxHeight = 300 }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <Box
      sx={{
        maxHeight,
        overflow: 'auto',
        '& .ProseMirror': {
          outline: 'none',
          '& h1': {
            fontSize: '2rem',
            fontWeight: 'bold',
            marginTop: '1rem',
            marginBottom: '0.5rem',
          },
          '& h2': {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginTop: '1rem',
            marginBottom: '0.5rem',
          },
          '& h3': {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginTop: '1rem',
            marginBottom: '0.5rem',
          },
          '& p': {
            marginBottom: '0.5rem',
          },
          '& ul, & ol': {
            paddingLeft: '1.5rem',
            marginBottom: '0.5rem',
          },
          '& li': {
            marginBottom: '0.25rem',
          },
          '& blockquote': {
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            paddingLeft: '1rem',
            marginLeft: 0,
            marginRight: 0,
            fontStyle: 'italic',
            color: 'text.secondary',
          },
          '& code': {
            backgroundColor: 'grey.100',
            padding: '0.125rem 0.25rem',
            borderRadius: '0.25rem',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
};

