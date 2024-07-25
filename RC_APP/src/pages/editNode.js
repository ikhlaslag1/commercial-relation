import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import EditForm from "../components/EditForm"; 

export default function editNode() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <EditForm />
        </Box>
      </Box>
    </>
  );
}
