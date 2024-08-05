import React, { useEffect, useState } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography, Divider,
  Button, Box, Stack, TextField, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Tooltip
} from "@mui/material";
import {
  AddCircle as AddCircleIcon, Info as InfoIcon, Edit as EditIcon,
  Delete as DeleteIcon, Close as CloseIcon, Link as LinkIcon,
  Search as SearchIcon, AddLink as AddLinkIcon
} from "@mui/icons-material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function OrganizationList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [deletingNodeId, setDeletingNodeId] = useState(null);
  const [allOrganization, setAllOrganizations] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nodes/org', {
        params: {
          page: page,
          limit: rowsPerPage,
          name: searchTerm,
          city: cityFilter,
          address: addressFilter,
          industry: industryFilter
        }
      });
      const { organizations, total } = response.data;
      setRows(organizations);
      setFilteredRows(organizations);
      setTotalRows(total);
      const allResponse = await axios.get('http://localhost:5000/nodes/all');
      setAllOrganizations(allResponse.data.organizations);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nodes/org', {
        params: {
          page: page,
          limit: rowsPerPage,
          name: searchTerm,
          city: cityFilter,
          address: addressFilter,
          industry: industryFilter
        }
      });
      const { organizations, total } = response.data;
      setFilteredRows(organizations);
      setTotalRows(total);
    } catch (error) {
      console.error('Error searching nodes:', error);
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
      navigate(`/associate/${selectedNode.id}/organization`);
    }
  };

  const handleEditClick = () => {
    if (selectedNode) {
      navigate(`/edit_Org/organization/${selectedNode.id}`);
    }
  };

  const handleDeleteClick = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/nodes/checkRelationships/organization/${selectedNode.id}`);
      if (response.data.hasRelationships) {
        setConfirmMessage('This organization has relationships. Deleting this organization will also delete all associated relationships. Are you sure you want to proceed?');
      } else {
        setConfirmMessage('Are you sure you want to delete this organization?');
      }
      setDeletingNodeId(selectedNode.id);
      setOpenConfirmDialog(true);
    } catch (error) {
      console.error('Error checking relationships:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/nodes/delete/organization/${deletingNodeId}`);
      setRows(rows.filter(org => org.id !== deletingNodeId));
      console.log('Organization deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
    setOpenConfirmDialog(false);
    handleDetailsClose();
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setDeletingNodeId(null);
  };

  const handleRelationsClick = (id) => {
    navigate(`/relations/organization/${id}`);
  };

  return (
    <>
      <Paper sx={{ width: "98%", overflow: "hidden", padding: "12px" }}>
        <Typography gutterBottom variant="h5" component="div" sx={{ padding: "20px" }}>
          <strong>Organizations List</strong>
        </Typography>
        <Divider />
        <Box height={10} />
        <Box sx={{ padding: "16px" }}>
        <Stack direction="row" spacing={2} className="my-2 mb-2" alignItems="center">
          <TextField
            size="small"
            label="Name"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            label="City"
            variant="outlined"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            label="Address"
            variant="outlined"
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            label="Industry"
            variant="outlined"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            sx={{ width: 150 }}
          />
          <IconButton
            color="primary"
            onClick={handleSearch}
            aria-label="search"
            sx={{ fontSize: 50 }}
          >
            <SearchIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}></Typography>
          <Button variant="contained" endIcon={<AddCircleIcon />} onClick={handleAddClick}>
            Add
          </Button>
        </Stack>
        </Box>
        <Box height={10} />
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left"><strong>Name</strong></TableCell>
                <TableCell align="left"><strong>City</strong></TableCell>
                <TableCell align="left"><strong>Address</strong></TableCell>
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
                      <Tooltip title="Associate" arrow>
                        <AddLinkIcon style={{ fontSize: "20px", color: "orange", cursor: "pointer" }} onClick={() => handleClickOpen(row.id)} />
                      </Tooltip>
                      <Tooltip title="View Relations" arrow>
                        <LinkIcon style={{ fontSize: "20px", color: "blue", cursor: "pointer" }} onClick={() => handleRelationsClick(row.id)} />
                      </Tooltip>
                      <Tooltip title="View Details" arrow>
                        <InfoIcon style={{ fontSize: "20px", color: "green", cursor: "pointer" }} onClick={() => handleDetailsOpen(row)} />
                      </Tooltip>
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
        <DialogTitle id="alert-dialog-title">{"Associate Organization"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to associate this organization?
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
                        <TableCell><strong>UUID:</strong></TableCell>
                        <TableCell>{selectedNode.uuid}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Name:</strong></TableCell>
                        <TableCell>{selectedNode.nom}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Address:</strong></TableCell>
                        <TableCell>{selectedNode.adresse}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Email:</strong></TableCell>
                        <TableCell>{selectedNode.email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Phone Number:</strong></TableCell>
                        <TableCell>{selectedNode.telephone}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>City:</strong></TableCell>
                        <TableCell>{selectedNode.ville}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Industry:</strong></TableCell>
                        <TableCell>{selectedNode.industry}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Website:</strong></TableCell>
                        <TableCell>{selectedNode.siteWeb}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Created at:</strong></TableCell>
                        <TableCell>{selectedNode.createdAt}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Updated at:</strong></TableCell>
                        <TableCell>{selectedNode.updatedAt}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Tooltip title="Edit" arrow>
            <IconButton color="primary" onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow>
            <IconButton style={{ color: 'red' }} onClick={handleDeleteClick}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton color="default" onClick={handleDetailsClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
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
          <Button onClick={handleConfirmDelete} style={{ color: 'red' }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
