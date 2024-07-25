import React, { useEffect, useState } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography, Divider,
  Button, Box, Stack, TextField, Autocomplete, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { AddCircle as AddCircleIcon, Info as InfoIcon, AllInclusive as AllInclusiveIcon } from "@mui/icons-material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function OrganizationList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedNodeType, setSelectedNodeType] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nodes/org', {
        params: {
          page: page,
          limit: rowsPerPage,
          name: searchTerm 
        }
      });
      const { organizations, total } = response.data;
      setRows(organizations);
      setFilteredRows(organizations);
      setTotalRows(total);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleAddClick = () => {
    navigate('/add_Organization');
  };

  const handleClickOpen = (id, type) => {
    setSelectedNodeId(id);
    setSelectedNodeType(type);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const associateNode = () => {
    if (selectedNodeId && selectedNodeType) {
      navigate(`/associate/${selectedNodeId}/${selectedNodeType}`);
    }
  };

  const viewDetails = (id, type) => {
    navigate(`/OrgDetails/${type}/${id}`);
  };

  const handleSearchChange = (event, newValue) => {
    setSearchTerm(newValue ? newValue.nom : '');
  };

  return (
    <>
      <Paper sx={{ width: "98%", overflow: "hidden", padding: "12px" }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ padding: "20px" }}>
          <strong>Organizations List</strong>
        </Typography>
        <Divider />
        <Box height={10} />
        <Stack direction="row" spacing={2} className="my-2 mb-2" alignItems="center">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={rows} 
            sx={{ width: 300 }}
            getOptionLabel={(row) => row.nom || ""}
            onChange={handleSearchChange}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Search Organization" />
            )}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <Button variant="contained" endIcon={<AddCircleIcon />} onClick={handleAddClick}>
            Add
          </Button>
        </Stack>
        <Box height={10} />
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left"><strong>Name</strong></TableCell>
                <TableCell align="left"><strong>Ville</strong></TableCell>
                <TableCell align="left"><strong>Adresse</strong></TableCell>
                <TableCell align="left"><strong>Email</strong></TableCell>
                <TableCell align="left"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {filteredRows.map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                <TableCell align="left">{row.nom}</TableCell>
                <TableCell align="left">{row.ville}</TableCell>
                <TableCell align="left">{row.adresse}</TableCell>
                <TableCell align="left">{row.email}</TableCell>
                <TableCell align="left">
                    <Stack spacing={2} direction="row">
                    <AllInclusiveIcon style={{ fontSize: "20px", color: "orange", cursor: "pointer" }} onClick={() => handleClickOpen(row.id, 'organization')} />
                    <InfoIcon style={{ fontSize: "20px", color: "green", cursor: "pointer" }} onClick={() => viewDetails(row.id, 'organization')} />
                    </Stack>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Associate Node"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to associate this node?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={associateNode} autoFocus>Associate</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
