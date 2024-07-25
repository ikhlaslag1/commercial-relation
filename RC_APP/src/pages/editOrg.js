import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import EditOrg from "../components/EditOrg"; 

export default function editNode() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <EditOrg />
        </Box>
      </Box>
    </>
  );
}
