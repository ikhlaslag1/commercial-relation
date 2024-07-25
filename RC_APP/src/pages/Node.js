import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import NodeList from "../components/Nodes"; 

export default function Home() {
  return (
    <>
    <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <NodeList />
        </Box>
      </Box>
    
    </>
  );
}
