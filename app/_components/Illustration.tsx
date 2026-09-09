import Box from '@mui/material/Box';

export type IllustrationVariant =
  'arc' | 'stack' | 'dots' | 'circle' | 'split' | 'rings' | 'zig' | 'nest';

const c = (n: number) => `var(--mui-palette-ill${n})`;

function Shape({ sx }: { sx: object }) {
  return <Box sx={{ position: 'absolute', ...sx }} />;
}

export default function Illustration({ variant }: { variant: IllustrationVariant }) {
  const fill = {
    position: 'absolute' as const,
    inset: 0,
    overflow: 'hidden',
  };

  switch (variant) {
    case 'arc':
      return (
        <Box sx={{ ...fill, bgcolor: c(1) }}>
          <Shape
            sx={{
              width: '110%',
              aspectRatio: '1',
              left: '-5%',
              bottom: '-55%',
              borderRadius: '999px',
              bgcolor: c(3),
            }}
          />
          <Shape
            sx={{
              left: '14%',
              right: '14%',
              top: '22%',
              height: '1px',
              bgcolor: c(4),
              opacity: 0.35,
            }}
          />
        </Box>
      );
    case 'stack':
      return (
        <Box sx={{ ...fill, bgcolor: c(1) }}>
          <Shape
            sx={{
              left: '16%',
              height: '6px',
              borderRadius: '999px',
              top: '26%',
              width: '28%',
              bgcolor: c(3),
            }}
          />
          <Shape
            sx={{
              left: '16%',
              height: '6px',
              borderRadius: '999px',
              top: '44%',
              width: '50%',
              bgcolor: c(4),
            }}
          />
          <Shape
            sx={{
              left: '16%',
              height: '6px',
              borderRadius: '999px',
              top: '62%',
              width: '38%',
              bgcolor: c(3),
            }}
          />
          <Shape
            sx={{
              left: '16%',
              height: '6px',
              borderRadius: '999px',
              top: '78%',
              width: '22%',
              bgcolor: c(3),
              opacity: 0.55,
            }}
          />
        </Box>
      );
    case 'dots':
      return (
        <Box sx={{ ...fill, bgcolor: c(1) }}>
          <Box
            sx={{
              position: 'absolute',
              inset: '22%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: '10%',
            }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: 'center',
                  justifySelf: 'center',
                  aspectRatio: '1',
                  borderRadius: '999px',
                  bgcolor: i === 5 ? c(4) : c(3),
                  width: i === 5 ? '130%' : '70%',
                }}
              />
            ))}
          </Box>
        </Box>
      );
    case 'circle':
      return (
        <Box sx={{ ...fill, bgcolor: c(5) }}>
          <Shape
            sx={{
              width: '55%',
              aspectRatio: '1',
              right: '12%',
              top: '14%',
              borderRadius: '999px',
              border: '6px solid',
              borderColor: c(3),
            }}
          />
          <Shape
            sx={{
              width: '18%',
              aspectRatio: '1',
              left: '16%',
              bottom: '18%',
              bgcolor: c(4),
              borderRadius: '3px',
            }}
          />
        </Box>
      );
    case 'split':
      return (
        <Box
          sx={{ ...fill, background: `linear-gradient(115deg, ${c(2)} 0 50%, ${c(3)} 50% 100%)` }}
        >
          <Shape
            sx={{
              width: '28%',
              aspectRatio: '1',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              bgcolor: c(1),
              borderRadius: '3px',
            }}
          />
        </Box>
      );
    case 'rings':
      return (
        <Box sx={{ ...fill, bgcolor: c(1) }}>
          <Shape
            sx={{
              width: '48%',
              aspectRatio: '1',
              left: '18%',
              top: '18%',
              borderRadius: '999px',
              border: '1.5px solid',
              borderColor: c(4),
            }}
          />
          <Shape
            sx={{
              width: '48%',
              aspectRatio: '1',
              right: '14%',
              bottom: '16%',
              borderRadius: '999px',
              border: '1.5px solid',
              borderColor: c(4),
            }}
          />
          <Shape
            sx={{
              width: '14%',
              aspectRatio: '1',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '999px',
              bgcolor: c(4),
            }}
          />
        </Box>
      );
    case 'zig':
      return (
        <Box sx={{ ...fill, bgcolor: c(2) }}>
          <Shape
            sx={{
              height: '2px',
              bgcolor: c(4),
              borderRadius: '2px',
              transformOrigin: 'left center',
              left: '14%',
              top: '38%',
              width: '36%',
              transform: 'rotate(-18deg)',
            }}
          />
          <Shape
            sx={{
              height: '2px',
              bgcolor: c(4),
              borderRadius: '2px',
              transformOrigin: 'left center',
              left: '42%',
              top: '50%',
              width: '36%',
              transform: 'rotate(22deg)',
            }}
          />
          <Shape
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              bgcolor: c(1),
              border: '2px solid',
              borderColor: c(4),
              left: '12%',
              top: '36%',
            }}
          />
          <Shape
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              bgcolor: c(1),
              border: '2px solid',
              borderColor: c(4),
              left: '44%',
              top: '60%',
            }}
          />
          <Shape
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              bgcolor: c(1),
              border: '2px solid',
              borderColor: c(4),
              left: '80%',
              top: '32%',
            }}
          />
        </Box>
      );
    case 'nest':
      return (
        <Box sx={{ ...fill, bgcolor: c(1) }}>
          <Shape
            sx={{ inset: '18%', borderRadius: '3px', border: '1.5px solid', borderColor: c(4) }}
          />
          <Shape
            sx={{ inset: '30%', borderRadius: '3px', border: '1.5px solid', borderColor: c(4) }}
          />
          <Shape sx={{ inset: '42%', borderRadius: '3px', bgcolor: c(4) }} />
        </Box>
      );
    default:
      return null;
  }
}
