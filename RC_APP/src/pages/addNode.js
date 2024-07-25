import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import AddNodeForm from "../components/addNodeForm"; 

export default function addNode() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <AddNodeForm />
        </Box>
      </Box>
    </>
  );
}
