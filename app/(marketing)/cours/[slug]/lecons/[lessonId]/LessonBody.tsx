'use client';

import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function LessonBody({ contentMd }: { contentMd: string }) {
  return (
    <Box
      sx={{
        fontSize: '16.5px',
        lineHeight: 1.65,
        color: 'text.primary',
        '& h2': { fontSize: '22px', fontWeight: 600, mt: 4, mb: 1.5, letterSpacing: '-0.01em' },
        '& h3': { fontSize: '18px', fontWeight: 600, mt: 3, mb: 1 },
        '& p': { my: 2 },
        '& ul, & ol': { my: 2, pl: 3 },
        '& li': { my: 0.75 },
        '& a': { color: 'text.primary', textDecoration: 'underline' },
        '& blockquote': {
          my: 2,
          pl: 2,
          borderLeft: '2px solid',
          borderColor: 'divider',
          color: 'text.secondary',
        },
        '& code': {
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          fontSize: '0.9em',
          bgcolor: 'background.sunk',
          px: '4px',
          py: '2px',
          borderRadius: '4px',
        },
        '& pre': {
          my: 2,
          p: 2,
          overflowX: 'auto',
          bgcolor: 'background.sunk',
          border: '1px solid',
          borderColor: 'dividerSoft',
          borderRadius: '10px',
        },
        '& pre code': { bgcolor: 'transparent', p: 0 },
        '& table': { my: 2, width: '100%', borderCollapse: 'collapse', fontSize: '15px' },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'dividerSoft',
          p: '8px 10px',
          textAlign: 'left',
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {contentMd}
      </ReactMarkdown>
    </Box>
  );
}
