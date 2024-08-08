import React, { useEffect, useState,useRef } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, Typography, Divider,
  Button, Box, Stack, TextField, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Tooltip, Menu, MenuItem
} from "@mui/material";
import {
  AddCircle as AddCircleIcon, Info as InfoIcon, Edit as EditIcon,
  Delete as DeleteIcon, Close as CloseIcon, Link as LinkIcon,
  Search as SearchIcon, AddLink as AddLinkIcon, SystemUpdateAlt as SystemUpdateAltIcon
} from "@mui/icons-material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';

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
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const filterIconRef = useRef(null);

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
    navigate('/add_Organization');
    handleCloseAddDialog();
  };

  const handleAddList = () => {
    setOpenUploadDialog(true);
  };
  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setError('');
    setFileName('');
    setSelectedFile(null);
    setMessage(''); 
    navigate('/Organization'); 
    setOpenUploadDialog(false);
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
      await axios.post('http://localhost:5000/nodes/addOrgList', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully');
      navigate('/Organization');
      handleCloseUploadDialog(); 
      setError('');
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file ; it does not contain all required properties for organization; Please choose an other file ');
      
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
      <Typography gutterBottom variant="h5" component="div" sx={{ padding: "20px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' ,marginTop: "-30px",fontSize: 30}}>
  <strong>Organizations List</strong>
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
          sx={{ fontSize: 30 }}
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
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            sx={{ width: 150 }}
          />
        )}
        {activeFilters.includes('address') && (
          <TextField
            size="small"
            label="Address"
            variant="outlined"
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            sx={{ width: 150 }}
          />
        )}
        {activeFilters.includes('industry') && (
          <TextField
            size="small"
            label="Industry"
            variant="outlined"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
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
        <MenuItem onClick={() => handleFilterClick('industry')}>Industry</MenuItem>
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

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
  <DialogTitle>Add Organization</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Would you like to add one organization or a list of organizations?
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ justifyContent: 'center' }}>
    <Stack direction="row" spacing={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddOnePerson}
      >
        Add One 
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddList}
      >
        Add List
      </Button>
    </Stack>
    <IconButton
      edge="end"
      color="default"
      onClick={handleCloseAddDialog}
      aria-label="close"
      sx={{ position: 'absolute', right: 16, top: 16 }}
    >
      <CloseIcon />
    </IconButton>
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
        Error uploading file; it does not contain all required properties for organization.
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

    </>
  );
}
