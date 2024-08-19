import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import SimpleBar from 'simplebar-react';
import { styled } from '@mui/system';
import { formatDistanceToNow } from 'date-fns';
import Divider from '@mui/material/Divider';
// ----------------------------------------------------------------------
export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

const StyledRootScrollbar = styled('div')(() => ({
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden',
}));

const StyledScrollbar = styled(SimpleBar)({
  maxHeight: '100%',
  '& .simplebar-scrollbar': {
    '&:before': {
      backgroundColor: 'rgba(117, 117, 117, 0.48)', 
    },
    '&.simplebar-visible:before': {
      opacity: 1,
    },
  },
  '& .simplebar-mask': {
    zIndex: 'inherit',
  },
});

const Scrollbar = forwardRef(({ children, sx, ...other }, ref) => {
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (mobile) {
    return (
      <Box ref={ref} sx={{ overflow: 'auto', ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <StyledRootScrollbar>
      <StyledScrollbar
        scrollableNodeProps={{
          ref,
        }}
        clickOnTrack={false}
        sx={sx}
        {...other}
      >
        {children}
      </StyledScrollbar>
    </StyledRootScrollbar>
  );
});

Scrollbar.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default function AppNewsUpdate({ title, subheader, list = [], ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
      {/* Column Titles */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
        <Box sx={{ minWidth: 200, flexGrow: 1, left:20 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            __ From
          </Typography>
        </Box>
        <Box sx={{ minWidth: 200, flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            To
          </Typography>
        </Box>
        <Box sx={{ minWidth: 150, flexGrow: 1 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
            Type
          </Typography>
        </Box>
      </Stack>
      <Divider />

        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {list.map((news) => (
            <NewsItem key={news.id} news={news} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  );
}

AppNewsUpdate.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

// ----------------------------------------------------------------------

function NewsItem({ news }) {
  const { from, to, type, date } = news;

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1 }}>
        
        <Box sx={{ minWidth: 200, flexGrow: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {from}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 200, flexGrow: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {to}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 150, flexGrow: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {type}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
          {fToNow(date)}
        </Typography>
      </Stack>
      <Divider />
    </>
  );
}
NewsItem.propTypes = {
  news: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
    type: PropTypes.string,
    date: PropTypes.instanceOf(Date),
  }).isRequired,
};
