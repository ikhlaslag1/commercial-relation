import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import OrganizationList from "../components/Organization"; 

export default function Home() {
  return (
    <>
    <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <OrganizationList />
        </Box>
      </Box>
    
    </>
  );
}
