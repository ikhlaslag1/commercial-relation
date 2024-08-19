import React, { useState } from 'react';
import {
  Container, Typography, Card, CardContent, Box, TextField, IconButton, Select, FormControl, InputLabel, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Grid, Pagination, Alert, Menu, List, ListItem,ListItemText,FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

import axios from 'axios';

const PathSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNode1, setSelectedNode1] = useState(null);
  const [selectedNode2, setSelectedNode2] = useState(null);
  const [pathType, setPathType] = useState('shortest');
  const [paths, setPaths] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [relationshipType, setRelationshipType] = useState('');
  const [hasSearched, setHasSearched] = useState(false);


  const handleRelationshipTypeChange = (event) => {
    setRelationshipType(event.target.value);
  };
  

  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const relationsPerPage = 5;

  const handleSearch = async () => {
    if (searchTerm.length > 2) {
      try {
        const response = await axios.post(`http://localhost:5000/nodes/search?nodeName=${searchTerm}`);
        setSearchResults(response.data.nodes);
        setSearchDialogOpen(true);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  const handleSelectNode = (node) => {
    console.log('Node selected:', node);
  
    if (!selectedNode1) {
      setSelectedNode1(node);
      console.log('Selected Node 1:', node);
    } else if (!selectedNode2) {
      setSelectedNode2(node);
      console.log('Selected Node 2:', node);
    } else {
      console.log('Both nodes are already selected.');
    }
  
    setSearchResults([]);
    setSearchTerm('');
  };
  

  const handlePathSearch = async () => {
    if (selectedNode1 && selectedNode2) {
      const endpoint = pathType === 'shortest'
        ? `http://localhost:5000/relations/allBetween/${selectedNode1.uuid}/${selectedNode2.uuid}`
        : `http://localhost:5000/relations/paths/${selectedNode1.uuid}/${selectedNode2.uuid}`;
  
      try {
        const response = await axios.post(endpoint, {
          relationshipTypes: selectedTypes.length > 0 ? selectedTypes : []
        });
        const data = response.data;
  
        if (Array.isArray(data)) {
          setPaths(data);
          
        } else {
          console.error('Error: paths is not an array', data);
          setPaths([]);
        }
      } catch (error) {
        console.error('Error fetching paths:', error);
        setPaths([]);
      }
      setHasSearched(true);
    } else {
      console.error('Node 1 or Node 2 is not selected');
    }
  };
  
  
  const handleOpenDialog = (endNodeProperties, relationshipDetails) => {
    setSelectedProperties({ ...endNodeProperties, ...relationshipDetails });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProperties(null);
  };
  const handleDeselectNode = (nodeNumber) => {
    if (nodeNumber === 1) {
      setSelectedNode1(null);
    } else if (nodeNumber === 2) {
      setSelectedNode2(null);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const handleTypeChange = async (type) => {
    const updatedSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
  
    setSelectedTypes(updatedSelectedTypes);
  
    const response = await axios.post('http://localhost:5000/relations/filtre', { types: updatedSelectedTypes });
    setPaths(response.data);
  };
  
  const relationshipTypes = ['FAMILLE', 'TRAVAILLE', 'AMITIE', 'COLLABORATION', 'ETUDE'];

  const filteredRelations = selectedTypes.length > 0 
  ? paths.filter(path => 
      path.relationships.every(rel => selectedTypes.includes(rel.type))
    )
  : paths;

const indexOfLastRelation = currentPage * relationsPerPage;
const indexOfFirstRelation = indexOfLastRelation - relationsPerPage;
const currentRelations = filteredRelations.slice(indexOfFirstRelation, indexOfLastRelation);

  
  return (
   
    <Container maxWidth="lg" sx={{
    maxWidth: '100vw',
    overflowX: 'auto', 
    boxSizing: 'border-box',
    padding: '20px',
  }}>
     

     
      <Card sx={{ mb: 3 }}>
        <CardContent>
        <Typography gutterBottom variant="h4" component="div" sx={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}>
        Path Search
      </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexDirection="row">
            
            <TextField
              label={`Search `}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="midium"
              sx={{ width: 400 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />

           
            
          </Box>
          {selectedNode1 && (
         <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
         {selectedNode1 && selectedNode2 && (
        <>
         <IconButton
          onClick={handleClick}
          aria-label="filter paths"
          sx={{ marginTop: 3, marginLeft: 1, fontSize: 30, marginRight: 2 }}  
        >
          <FilterListIcon sx={{ fontSize: 'inherit' }} />  
        </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { setPathType('shortest'); handleClose(); }}>
              Shortest
            </MenuItem>
            <MenuItem onClick={() => { setPathType('all'); handleClose(); }}>
              All
            </MenuItem>
          </Menu>
        </>
      )}
    <Card sx={{ minWidth: 230, mr: 2, borderRadius: 2, boxShadow: 3, marginTop: 3, position: 'relative' }}>
      <CardContent>
        
        <Typography variant="body2">
          <strong> {selectedNode1.nom}</strong>
        </Typography>
        <Typography variant="body2">
          <strong>ID:</strong> {selectedNode1.id}
        </Typography>
      </CardContent>
      <IconButton
        onClick={() => handleDeselectNode(1)}
        aria-label="deselect node 1"
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </Card>

    {selectedNode1 && selectedNode2 && (
  <FormControl sx={{ minWidth: 150, marginTop: 3 }}>
    <InputLabel> Type</InputLabel>
    <Select
      multiple
      value={selectedTypes}
      onChange={(event) => setSelectedTypes(event.target.value)}
      renderValue={(selected) => selected.join(', ')}
      label="Type"
      sx={{ height: '140%', marginRight: '20px' }}
    >
      
      <MenuItem value="AMITIE">Friendship</MenuItem>
      <MenuItem value="COLLABORATION">Collaboration</MenuItem>
      <MenuItem value="FAMILLE">Family</MenuItem>
      <MenuItem value="ETUDE">Study</MenuItem>
      <MenuItem value="TRAVAILLE">Work</MenuItem>
    </Select>
  </FormControl>
)}

    {selectedNode2 && (
      <Card sx={{ minWidth: 230, borderRadius: 2, boxShadow: 3, marginTop: 3, position: 'relative' }}>
        <CardContent>
          <Typography variant="body2">
            <strong>{selectedNode2.nom}</strong>
          </Typography>
          <Typography variant="body2">
            <strong>ID:</strong> {selectedNode2.id}
          </Typography>
        </CardContent>
        <IconButton
          onClick={() => handleDeselectNode(2)}
          aria-label="deselect node 2"
          sx={{ position: 'absolute', top: 9, right: 9, fontSize:5 }}
        >
          <CloseIcon />
        </IconButton>
      </Card>
    )}

       
            {selectedNode1 && selectedNode2 && (
              <IconButton
                color="primary"
                onClick={handlePathSearch}
                aria-label="search"
                sx={{ fontSize: 35, marginTop: 3, marginLeft:2 }}
                
              >
                <SearchIcon sx={{ fontSize: 'inherit' }}/>
              </IconButton>
            )}
        </Box>
      )}

        </CardContent>
      </Card>
     
     
     
    
      {hasSearched && paths.length === 0 && (
        <Typography variant="h6" align="center">
          No paths found.
        </Typography>
      )}

      {currentRelations.length > 0 && (
  <Grid container spacing={3}>
  {filteredRelations.slice(indexOfFirstRelation, indexOfLastRelation).map((path, pathIndex) => (
    <Grid item xs={12} key={pathIndex}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Path {indexOfFirstRelation + pathIndex + 1}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', overflowX: 'auto', padding: 1, flexWrap: 'nowrap', maxWidth: '100%' }}>
            {path.nodes.map((node, nodeIndex) => (
              <React.Fragment key={nodeIndex}>
                {nodeIndex > 0 && (
                  <ArrowForwardIcon sx={{ marginX: 1 }} />
                )}
                <Card sx={{ minWidth: 250, mr: 2, borderRadius: 2, boxShadow: 3, flexShrink: 0 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        <strong>From:</strong> {node.start.nom || 'Unknown'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>To:</strong> {node.end.nom || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        <strong>Relationship:</strong> {path.relationships[nodeIndex]?.type || 'Unknown'}
                      </Typography>
                    </Box>
                    <Button 
                      endIcon={<InfoIcon />} 
                      onClick={() => handleOpenDialog(node.end, path.relationships[nodeIndex])}
                      sx={{ position: 'absolute', bottom: 1, right: 1 }}
                    >
                    </Button>
                  </CardContent>
                </Card>
              </React.Fragment>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

)}

      {paths.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(paths.length / relationsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
 
<Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm">
  <DialogTitle>Details</DialogTitle>
  <DialogContent>
    {selectedProperties && (
      <>
        {/* Table for all properties */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>{selectedProperties.nom}'s Properties</strong></TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(selectedProperties).map(([key, value]) => (
              key !== 'properties' && key !== 'type' && (
                <TableRow key={key}>
                  <TableCell><strong>{key}</strong></TableCell>
                  <TableCell>{typeof value === 'object' ? JSON.stringify(value) : value}</TableCell>
                </TableRow>
              )
            ))}
          </TableBody>
        </Table>

        {/* Table for specific properties */}
        <Table >
          <TableHead>
            <TableRow>
              <TableCell><strong>Relation Properties</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedProperties.type && (
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell>{selectedProperties.type}</TableCell>
              </TableRow>
            )}
            {selectedProperties.properties && (
              <>
                {Object.entries(selectedProperties.properties).map(([propKey, propValue]) => (
                  <TableRow key={propKey}>
                    <TableCell><strong>{propKey}</strong></TableCell>
                    <TableCell>{propValue}</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Search Results</DialogTitle>
  <DialogContent dividers>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell><strong>ID</strong></TableCell>
          <TableCell><strong>Name</strong></TableCell>
          <TableCell><strong>City</strong></TableCell>
          <TableCell><strong>Email</strong></TableCell>
          <TableCell><strong>Age</strong></TableCell>
          <TableCell><strong>Industry</strong></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {searchResults.map((node) => (
          <TableRow
            key={node.uuid}
            hover
            onClick={() => {
              handleSelectNode(node);
              setSearchDialogOpen(false);
            }}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
          
            <TableCell>{node.id}</TableCell>
            <TableCell>{node.nom}</TableCell>
            <TableCell>{node.ville || 'N/A'}</TableCell>
            <TableCell>{node.email || 'N/A'}</TableCell>
            <TableCell>{node.age || 'N/A'}</TableCell>
            <TableCell>{node.industry || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setSearchDialogOpen(false)} color="primary">Close</Button>
  </DialogActions>
</Dialog>

    </Container>
   
  );
};

export default PathSearch;
