import React, { useState } from 'react';
import {
  Container, Typography, Card, CardContent, Box, TextField, IconButton, Select, FormControl, InputLabel, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Grid, Pagination, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';

const Arrow = () => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    '&::after': {
      content: '""',
      display: 'block',
      width: 0,
      height: 0,
      borderTop: '10px solid transparent',
      borderBottom: '10px solid transparent',
      borderLeft: '10px solid #3f51b5',
    }
  }} />
);

const PathSearch = () => {
  const [node1, setNode1] = useState('');
  const [node2, setNode2] = useState('');
  const [node1Results, setNode1Results] = useState([]);
  const [node2Results, setNode2Results] = useState([]);
  const [selectedNode1, setSelectedNode1] = useState(null);
  const [selectedNode2, setSelectedNode2] = useState(null);
  const [pathType, setPathType] = useState('shortest');
  const [paths, setPaths] = useState([]);
  const [selectedNode1Ids, setSelectedNode1Ids] = useState([]);
  const [selectedNode2Ids, setSelectedNode2Ids] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const relationsPerPage = 5;

  const handleNode1Change = (event) => setNode1(event.target.value);

  const handleNode2Change = (event) => setNode2(event.target.value);

  const handleSearchNode1 = async () => {
    if (node1.length > 2) {
      try {
        const response = await axios.post(`http://localhost:5000/nodes/search?nodeName=${node1}`);
        setNode1Results(response.data.nodes);
      } catch (error) {
        console.error('Error fetching node1 results:', error);
      }
    }
  };

  const handleSearchNode2 = async () => {
    if (node2.length > 2) {
      try {
        const response = await axios.post(`http://localhost:5000/nodes/search?nodeName=${node2}`);
        setNode2Results(response.data.nodes);
      } catch (error) {
        console.error('Error fetching node2 results:', error);
      }
    }
  };

  const handleSelectNode1 = (node) => {
    setSelectedNode1(node);
    setNode1Results([]);
    setNode1(node.nom);
  };

  const handleSelectNode2 = (node) => {
    setSelectedNode2(node);
    setNode2Results([]);
    setNode2(node.nom);
  };

  const handleSearch = async () => {
    if (selectedNode1 && selectedNode2) {
      const endpoint = pathType === 'shortest'
        ? `http://localhost:5000/relations/allBetween/${selectedNode1.uuid}/${selectedNode2.uuid}`
        : `http://localhost:5000/relations/paths/${selectedNode1.uuid}/${selectedNode2.uuid}`;

      try {
        const response = await axios.get(endpoint);
        setPaths(response.data);
      } catch (error) {
        console.error('Error fetching paths:', error);
      }
    }
  };

  const handleNode1Select = (nodeId) => {
    setSelectedNode1Ids(prevState =>
      prevState.includes(nodeId) ? prevState.filter(id => id !== nodeId) : [...prevState, nodeId]
    );
  };

  const handleNode2Select = (nodeId) => {
    setSelectedNode2Ids(prevState =>
      prevState.includes(nodeId) ? prevState.filter(id => id !== nodeId) : [...prevState, nodeId]
    );
  };

  const handleOpenDialog = (properties) => {
    setSelectedProperties(properties);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProperties(null);
  };

  const indexOfLastRelation = currentPage * relationsPerPage;
  const indexOfFirstRelation = indexOfLastRelation - relationsPerPage;
  const currentRelations = paths.slice(indexOfFirstRelation, indexOfLastRelation);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Typography gutterBottom variant="h4" component="div" sx={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}>
        Path Search
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} flexDirection="row">
            <TextField
              label="Name 1"
              value={node1}
              onChange={handleNode1Change}
              size="small"
              sx={{ width: 250 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearchNode1}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />

            <TextField
              label="Name 2"
              value={node2}
              onChange={handleNode2Change}
              size="small"
              sx={{ width: 250 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearchNode2}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Path Type</InputLabel>
              <Select
                value={pathType}
                onChange={(e) => setPathType(e.target.value)}
                label="Path Type"
                size="small"
              >
                <MenuItem value="shortest">Shortest</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>

            {selectedNode1 && selectedNode2 && (
              <IconButton
                color="primary"
                onClick={handleSearch}
                aria-label="search"
                sx={{ fontSize: 50 }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Node 1 Results Table */}
      {node1Results.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Industry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {node1Results.map((node) => (
                <TableRow key={node.uuid} onClick={() => handleSelectNode1(node)}>
                  <TableCell>
                    <Checkbox
                      checked={selectedNode1Ids.includes(node.uuid)}
                      onChange={() => handleNode1Select(node.uuid)}
                    />
                  </TableCell>
                  <TableCell>{node.nom}</TableCell>
                  <TableCell>{node.type}</TableCell>
                  <TableCell>{node.ville || 'N/A'}</TableCell>
                  <TableCell>{node.email || 'N/A'}</TableCell>
                  <TableCell>{node.age || 'N/A'}</TableCell>
                  <TableCell>{node.industry || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Node 2 Results Table */}
      {node2Results.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Industry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {node2Results.map((node) => (
                <TableRow key={node.uuid} onClick={() => handleSelectNode2(node)}>
                  <TableCell>
                    <Checkbox
                      checked={selectedNode2Ids.includes(node.uuid)}
                      onChange={() => handleNode2Select(node.uuid)}
                    />
                  </TableCell>
                  <TableCell>{node.nom}</TableCell>
                  <TableCell>{node.type}</TableCell>
                  <TableCell>{node.ville || 'N/A'}</TableCell>
                  <TableCell>{node.email || 'N/A'}</TableCell>
                  <TableCell>{node.age || 'N/A'}</TableCell>
                  <TableCell>{node.industry || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    {/* Paths Display */}
{currentRelations.length > 0 && (
  <Grid container spacing={3}>
    {currentRelations.map((path, pathIndex) => (
      <Grid item xs={12} key={pathIndex}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Path {indexOfFirstRelation + pathIndex + 1}</Typography>
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              overflowX: 'auto', // Add horizontal scrolling
              padding: 1
            }}>
              {path.nodes.map((node, nodeIndex) => (
                <React.Fragment key={nodeIndex}>
                  {nodeIndex > 0 && (
                    <React.Fragment>
                      <ArrowForwardIcon sx={{ marginX: 1 }} />
                    </React.Fragment>
                  )}
                  <Card sx={{ minWidth: 250, mr: 2, borderRadius: 2, boxShadow: 3, display: 'inline-block' }}>
                    <CardContent>
                      <Typography variant="body2">
                        <strong>From:</strong> {node.start.nom || 'Unknown'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>To:</strong> {node.end.nom || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        <strong>Relationship:</strong> {path.relationships[nodeIndex]?.type || 'Unknown'}
                      </Typography>
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

      {/* Dialog for Relationship Properties */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm">
        <DialogTitle>Relationship Properties</DialogTitle>
        <DialogContent>
          {selectedProperties && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Property</strong></TableCell>
                  <TableCell><strong>Value</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(selectedProperties).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PathSearch;
