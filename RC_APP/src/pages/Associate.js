import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import AddRelationForm from "../components/addRelationForm"; 

export default function addNode() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <AddRelationForm />
        </Box>
      </Box>
    </>
  );
}
