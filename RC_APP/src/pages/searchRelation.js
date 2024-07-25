import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import SearchRelations from "../components/searchRelations"; 

export default function Search() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <SearchRelations />
        </Box>
      </Box>
    </>
  );
}
