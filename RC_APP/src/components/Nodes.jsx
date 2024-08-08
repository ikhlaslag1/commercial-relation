import React, { useEffect, useState,useRef  } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography, Divider,
  Button, Box, Stack, TextField, IconButton, Tooltip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Menu, MenuItem
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { AddCircle as AddCircleIcon, Info as InfoIcon, AddLink as AddLinkIcon, Link as LinkIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, SystemUpdateAlt as SystemUpdateAltIcon} from "@mui/icons-material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function PersonList() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
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
  const [villeTerm, setVilleTerm] = useState('');
  const [adresseTerm, setAdresseTerm] = useState('');
  const [statusTerm, setStatusTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const filterIconRef = useRef(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
 
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nodes/pers', {
        params: {
          page: page,
          limit: rowsPerPage
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

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/nodes/pers', {
        params: {
          page: page,
          limit: rowsPerPage,
          name: searchTerm,
          ville: villeTerm,
          adresse: adresseTerm,
          status: statusTerm
        }
      });
      const { personnes, total } = response.data;
      setFilteredRows(personnes);
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
  const handleFilterClick = (type) => {
    setActiveFilters((prevFilters) => 
      prevFilters.includes(type) ? prevFilters.filter(filter => filter !== type) : [...prevFilters, type]
    );
    setFiltersOpen(false);
  };
  
  const handleAddClick = () => {
    setOpenAddDialog(true); 
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleAddOnePerson = () => {
    navigate('/add_Person');
    handleCloseAddDialog();
  };

  const handleAddList = () => {
    setOpenUploadDialog(true);
  };
  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setError('');
    setFileName('');
    setSelectedFile(null);
    setMessage(''); 
    navigate('/Personne'); 
    
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      setFileName(file.name);
    }
    setError('');
  };
  
  const handleUploadFile = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('files', selectedFile);

    try {
      await axios.post('http://localhost:5000/nodes/addPrsList', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('File uploaded successfully');
      navigate('/Personne');
      handleCloseUploadDialog(); 
      setError('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file ; it does not contain all required properties for person ');
      setMessage('Please choose an other file ');
    }
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
    navigate(`/relations/personne/${id}`);
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

  return (
    <>
      <Paper sx={{ width: "98%", overflow: "hidden", padding: "12px" }}>
      <Typography gutterBottom variant="h5" component="div" sx={{ padding: "20px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' ,marginTop: "-30px",fontSize: 30}}>
  <strong>Persons List</strong>
  <Button variant="contained" endIcon={<AddCircleIcon />} onClick={handleAddOnePerson} sx={{ marginLeft: 'auto',marginTop: "40px" }}>
    Add
  </Button>
</Typography>
<IconButton
  color="black"
  onClick={handleOpenUploadDialog}
  aria-label="import"
  sx={{
    marginLeft: "20px",
    marginTop: "-40px",
    marginBottom: "20px",
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    backgroundColor: 'transparent',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'primary', 
    },
  }}
>
  <SystemUpdateAltIcon sx={{ fontSize: 20, marginRight: '8px' }} />
  <Typography variant="body2" sx={{ fontSize: 16, color: 'black' }}>
    Import
  </Typography>
</IconButton>

        <Divider />
        <Box sx={{ padding: "16px" }}>
      <Stack direction="row" spacing={2} alignItems="center">
      <IconButton
          color="primary"
          onClick={() => setFiltersOpen(true)}
          aria-label="filter"
          sx={{ fontSize: 30}}
          ref={filterIconRef} 
        >
          <FilterListIcon />
        </IconButton>
      <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 200 }}
        />
      {activeFilters.includes('city') && (
          <TextField
            size="small"
            label="City"
            variant="outlined"
            value={villeTerm}
            onChange={(e) => setVilleTerm(e.target.value)}
            sx={{ width: 150 }}
          />
        )}
        {activeFilters.includes('address') && (
          <TextField
            size="small"
            label="Address"
            variant="outlined"
            value={adresseTerm}
            onChange={(e) => setAdresseTerm(e.target.value)}
            sx={{ width: 150 }}
          />
        )}
        {activeFilters.includes('status') && (
          <TextField
            size="small"
            label="Status"
            variant="outlined"
            value={statusTerm}
            onChange={(e) => setStatusTerm(e.target.value)}
            sx={{ width: 150 }}
          />
        )}
       
       
        <IconButton
          color="primary"
          onClick={handleSearch}
          aria-label="search"
          sx={{ fontSize: 30 }}
        >
          <SearchIcon />
        </IconButton>
      </Stack>
      <Menu
        anchorEl={filterIconRef.current}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{ mt: 2 }}
      >
        <MenuItem onClick={() => handleFilterClick('city')}>City</MenuItem>
        <MenuItem onClick={() => handleFilterClick('address')}>Address</MenuItem>
        <MenuItem onClick={() => handleFilterClick('status')}>Status</MenuItem>
      </Menu>
      
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


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Associate Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Would you like to associate this person with another node?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={associateNode} color="primary">
            Associate
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
  <DialogTitle>Upload File</DialogTitle>
  <DialogContent>
    <Stack spacing={2} alignItems="center">
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="upload-file"
      />
      <label htmlFor="upload-file">
        <Button variant="outlined" component="span" color="primary">
          Choose File
        </Button>
      </label>
      <Typography variant="body2" color="textSecondary">
        Only .xlsx files are supported.
      </Typography>
      {fileName && (
        <Typography variant="body2" color="textPrimary">
          Selected File: {fileName}
        </Typography>
      )}
      {message && (
      <Typography variant="body2" style={{ color: 'red' }}>
        Error uploading file; it does not contain all required properties for person.
        Please choose another file.
      </Typography>
    )}
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={handleUploadFile}
      variant="contained"
      color="primary"
      disabled={!fileName}
    >
      Upload
    </Button>
    <Button
      onClick={handleCloseUploadDialog}
      variant="outlined"
      color="primary"
    >
      Cancel
    </Button>
  </DialogActions>
</Dialog>

    
    
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
                        <TableCell><strong>Status:</strong></TableCell>
                        <TableCell>{selectedNode.status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Birth date:</strong></TableCell>
                        <TableCell>{selectedNode.age}</TableCell>
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

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDelete} color="secondary">
            Delete
          </Button>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
