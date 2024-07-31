import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import NodeDetails from "../components/relations"; 

export default function Details() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <NodeDetails />
        </Box>
      </Box>
    </>
  );
}
