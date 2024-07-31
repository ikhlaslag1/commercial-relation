import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import EditRelation from "../components/EditRelation"; 

export default function editNode() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <EditRelation />
        </Box>
      </Box>
    </>
  );
}
