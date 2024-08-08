import React from 'react';
import Sidenav from "../components/Sidenav";
import Box from '@mui/material/Box';
import Relations from '../components/relationDash';


export default function Relation() {
  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
        <Box sx={{ flexGrow: 1, p: 3 }}>
        <Relations />
        </Box>
      </Box>
    </>
  );
}
