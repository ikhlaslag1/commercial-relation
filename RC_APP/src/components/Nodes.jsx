import React, { useEffect, useState } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography, Divider,
  Button, Box, Stack, TextField, Autocomplete, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton
} from "@mui/material";

import { AddCircle as AddCircleIcon, Info as InfoIcon, AddLink as AddLinkIcon,Link as LinkIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function PersonList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [deletingPersonId, setDeletingPersonId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nodes/pers', {
        params: {
          page: page,
          limit: rowsPerPage,
          name: searchTerm
        }
      });
      const { personnes, total } = response.data;
      setRows(personnes);
      setFilteredRows(personnes);
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
    navigate('/add_Person');
  };

  const handleClickOpen = (id) => {
    setSelectedNode(rows.find(row => row.id === id));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDetailsOpen = (node) => {
    setSelectedNode(node);
    setDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
  };

  const associateNode = () => {
    if (selectedNode) {
      navigate(`/associate/${selectedNode.id}/personne`);
    }
  };

  const handleRelationsClick = (id) => {
    navigate(`/persDetails/personne/${id}`);
  };

  const handleEditClick = () => {
    if (selectedNode) {
      navigate(`/edit/personne/${selectedNode.id}`);
    }
  };

  const handleDeleteClick = async () => {
    try {
      
      const response = await axios.get(`http://localhost:5000/nodes/checkRelationships/personne/${selectedNode.id}`);
      if (response.data.hasRelationships) {
        setConfirmMessage('This person has relationships. Deleting this person will also delete all associated relationships. Are you sure you want to proceed?');
      } else {
        setConfirmMessage('Are you sure you want to delete this person?');
      }
      setDeletingPersonId(selectedNode.id);
      setOpenConfirmDialog(true);
    } catch (error) {
      console.error('Error checking relationships:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/nodes/delete/personne/${deletingPersonId}`);
      setRows(rows.filter(person => person.id !== deletingPersonId));
      fetchData();
    } catch (error) {
      console.error('Error deleting person:', error);
    }
    setOpenConfirmDialog(false);
    handleDetailsClose();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setDeletingPersonId(null);
  };

  const handleSearchChange = (event, newValue) => {
    setSearchTerm(newValue ? newValue.nom : '');
  };

  return (
    <>
      <Paper sx={{ width: "98%", overflow: "hidden", padding: "12px" }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ padding: "20px" }}>
          <strong>Persons List</strong>
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
              <TextField {...params} size="small" label="Search Person" />
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
              {(filteredRows || []).map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  <TableCell align="left">{row.nom}</TableCell>
                  <TableCell align="left">{row.ville}</TableCell>
                  <TableCell align="left">{row.adresse}</TableCell>
                  <TableCell align="left">{row.email}</TableCell>
                  <TableCell align="left">
                    <Stack spacing={2} direction="row">
                      <AddLinkIcon style={{ fontSize: "20px", color: "orange", cursor: "pointer" }} onClick={() => handleClickOpen(row.id)} />
                      <LinkIcon style={{ fontSize: "20px", color: "blue", cursor: "pointer" }} onClick={() => handleRelationsClick(row.id)} />
                      <InfoIcon style={{ fontSize: "20px", color: "green", cursor: "pointer" }} onClick={() => handleDetailsOpen(row)} />
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

      {/* Associate Node Dialog */}
      <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Associate Person"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to associate this Person?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={associateNode} autoFocus>Associate</Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleDetailsClose} aria-labelledby="details-dialog-title" aria-describedby="details-dialog-description">
        <DialogTitle id="details-dialog-title">{"Details"}</DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={1} style={{ padding: '20px' }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>ID:</strong></TableCell>
                        <TableCell>{selectedNode.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Name:</strong></TableCell>
                        <TableCell>{selectedNode.nom}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Age:</strong></TableCell>
                        <TableCell>{selectedNode.age}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>City:</strong></TableCell>
                        <TableCell>{selectedNode.ville}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Status:</strong></TableCell>
                        <TableCell>{selectedNode.status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Email:</strong></TableCell>
                        <TableCell>{selectedNode.email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Phone number:</strong></TableCell>
                        <TableCell>{selectedNode.telephone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Address:</strong></TableCell>
                        <TableCell>{selectedNode.adresse}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <IconButton color="primary" onClick={handleEditClick}>
            <EditIcon />
          </IconButton>
          <IconButton style={{ color: 'red' }}  onClick={handleDeleteClick}>
            <DeleteIcon />
          </IconButton>
          <IconButton color="default" onClick={handleDetailsClose}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog} aria-labelledby="confirm-delete-dialog-title">
        <DialogTitle id="confirm-delete-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">Cancel</Button>
          <Button onClick={handleConfirmDelete} style={{ color: 'red' }} >Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}