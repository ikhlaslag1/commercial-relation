import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import AddOrganization from "../components/addOrganization"; 

export default function addOrganization() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <AddOrganization />
        </Box>
      </Box>
    </>
  );
}
