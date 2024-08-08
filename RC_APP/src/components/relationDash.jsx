import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  Card
} from "@mui/material";
import { SystemUpdateAlt as SystemUpdateAltIcon } from "@mui/icons-material";
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from "react-router-dom";

export default function Relations() {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [personFiles, setPersonFiles] = useState([]);
  const [organizationFiles, setOrganizationFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [uploadType, setUploadType] = useState('person');
  const [relationType, setRelationType] = useState('');
  const [relationDetails, setRelationDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (uploadType === 'person') {
        setPersonFiles((prevFiles) => [...prevFiles, file]);
      } else {
        setOrganizationFiles((prevFiles) => [...prevFiles, file]);
      }
    }
  };

  const handleRelationChange = (event) => {
    const { name, value } = event.target;
    setRelationDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleUploadFile = async () => {
    const formData = new FormData();
    personFiles.forEach(file => formData.append('personFiles', file));
    organizationFiles.forEach(file => formData.append('organizationFiles', file));
    formData.append('relationType', relationType);
    formData.append('relationDetails', JSON.stringify(relationDetails));

    try {
      const response = await fetch('http://localhost:5000/nodes/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('Files uploaded and relations created successfully!');
        setPersonFiles([]);
        setOrganizationFiles([]);
        setRelationDetails({});
        setOpenUploadDialog(false);
        navigate('/Relations');
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setMessage('Error uploading files.');
    }
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setPersonFiles([]);
    setOrganizationFiles([]);
    setRelationType('');
    setRelationDetails({});
  };

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleTypeChange = (event) => {
    setUploadType(event.target.value);
  };

  const handleSearch = async (term) => {
    if (!term || term.trim() === '') {
      setMessage('Please enter a valid search term.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/nodes/search?nodeName=${term}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        const results = data.nodes || [];
        setSearchResults(results);
        setOpenSearchDialog(true);
      } else {
        const errorText = await response.text();
        setMessage(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setMessage('Error searching.');
    }
  };

  const handleCloseSearchDialog = () => {
    setOpenSearchDialog(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <Paper sx={{ width: "98%", overflow: "hidden", padding: "12px" }}>
      <Typography gutterBottom variant="h5" component="div" sx={{ padding: "20px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 30 }}>
        <strong>Relations</strong>
      </Typography>
      <IconButton
        color="black"
        onClick={handleOpenUploadDialog}
        aria-label="import"
        sx={{
          marginLeft: "20px",
          marginTop: "-20px",
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

      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} fullWidth>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Stack spacing={2} alignItems="center">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="upload-type-label">File type</InputLabel>
                  <Select
                    labelId="upload-type-label"
                    id="upload-type"
                    value={uploadType}
                    onChange={handleTypeChange}
                    label="File type"
                    size='small'
                  >
                    <MenuItem value="person">Person</MenuItem>
                    <MenuItem value="organization">Organization</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="upload-file"
                />
                <label htmlFor="upload-file">
                  <Button
                    variant="outlined"
                    component="span"
                    color="primary"
                    sx={{ width: '100%' }}
                  >
                    Choose File
                  </Button>
                </label>
                <Typography
                  variant="body2"
                  sx={{
                    textAlign: 'center',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    marginTop: 1
                  }}
                >
                  {personFiles.length > 0
                    ? personFiles.map(file => file.name).join(', ')
                    : organizationFiles.length > 0
                      ? organizationFiles.map(file => file.name).join(', ')
                      : ''}
                </Typography>
              </Grid>
            </Grid>

            {(personFiles.length > 0 || organizationFiles.length > 0) && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="relation-type-label">Select Relation Type</InputLabel>
                    <Select
                      labelId="relation-type-label"
                      id="relation-type"
                      value={relationType}
                      onChange={(event) => setRelationType(event.target.value)}
                      label="Select Relation Type"
                      size='small'
                    >
                      <MenuItem value="TRAVAILLE">TRAVAILLE</MenuItem>
                      <MenuItem value="ETUDE">ETUDE</MenuItem>
                      <MenuItem value="FAMILLE">FAMILLE</MenuItem>
                      <MenuItem value="COLLABORATION">COLLABORATION</MenuItem>
                      <MenuItem value="AMITIE">AMITIE</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {relationType === 'TRAVAILLE' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="relatedOrganization"
                        label="Related Organization"
                        value={relationDetails.relatedOrganization || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => handleSearch(relationDetails.relatedOrganization || '')}>
                              <SearchIcon />
                            </IconButton>
                          ),
                        }}
                      />
                    {(relationDetails.relatedOrganizationId) && (
                    <Grid item xs={12}>
                        <Typography variant="body2">
                        Selected Id: {relationDetails.relatedOrganizationId}
                        </Typography>
                    </Grid>
                    )}


                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="position"
                        label="Position"
                        value={relationDetails.position || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                  </>
                )}
                {relationType === 'ETUDE' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="relatedOrganization"
                        label="Related Institution"
                        value={relationDetails.relatedOrganization || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => handleSearch(relationDetails.relatedOrganization || '')}>
                              <SearchIcon />
                            </IconButton>
                          ),
                        }}
                      />
                      {(relationDetails.relatedOrganizationId) && (
                        <Grid item xs={12}>
                            <Typography variant="body2">
                            Selected Id: {relationDetails.relatedOrganizationId}
                            </Typography>
                        </Grid>
                        )}

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="domaine"
                        label="Field"
                        value={relationDetails.domaine || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="niveau"
                        label="Level"
                        value={relationDetails.niveau || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                  </>
                )}
                {relationType === 'FAMILLE' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="relatedPerson"
                        label="Related Person"
                        value={relationDetails.relatedPerson || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => handleSearch(relationDetails.relatedPerson || '')}>
                              <SearchIcon />
                            </IconButton>
                          ),
                        }}
                      />
                      {(relationDetails.relatedPersonId ) && (
                        <Grid item xs={12}>
                            <Typography variant="body2">
                            Selected Id: {relationDetails.relatedPersonId }
                            </Typography>
                        </Grid>
                        )}

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="type"
                        label="Type"
                        value={relationDetails.type || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                  </>
                )}
                {relationType === 'COLLABORATION' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="relatedOrganization"
                        label="Related Organization"
                        value={relationDetails.relatedOrganization || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => handleSearch(relationDetails.relatedOrganization || '')}>
                              <SearchIcon />
                            </IconButton>
                          ),
                        }}
                      />
                    {(relationDetails.relatedOrganizationId) && (
                    <Grid item xs={12}>
                        <Typography variant="body2">
                        Selected Id: { relationDetails.relatedOrganizationId}
                        </Typography>
                    </Grid>
                    )}

                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="projet"
                        label="Project"
                        value={relationDetails.projet || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="role"
                        label="Role"
                        value={relationDetails.role || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                      />
                    </Grid>
                  </>
                )}
                {relationType === 'AMITIE' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="relatedPerson"
                        label="Related Person"
                        value={relationDetails.relatedPerson || ''}
                        onChange={handleRelationChange}
                        fullWidth
                        size='small'
                        InputProps={{
                          endAdornment: (
                            <IconButton onClick={() => handleSearch(relationDetails.relatedPerson || '')}>
                              <SearchIcon />
                            </IconButton>
                          ),
                        }}
                      />
                      {(relationDetails.relatedPersonId) && (
                        <Grid item xs={12}>
                            <Typography variant="body2">
                            Selected Id: {relationDetails.relatedPersonId }
                            </Typography>
                        </Grid>
                        )}

                    </Grid>
                  </>
                )}
              </Grid>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} color="secondary">Cancel</Button>
          <Button onClick={handleUploadFile} color="primary">Upload</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSearchDialog} onClose={handleCloseSearchDialog} fullWidth>
        <DialogTitle>Search Results</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ cursor: 'pointer' }}>
                    <ListItem
                    onClick={() => {
                       
                        switch (relationType) {
                          case 'FAMILLE':
                            setRelationDetails({
                              ...relationDetails,
                              relatedPerson: result.nom,
                              relatedPersonId: result.id,
                            });
                            break;
                          case 'COLLABORATION':
                            setRelationDetails({
                              ...relationDetails,
                              relatedOrganization: result.nom,
                              relatedOrganizationId: result.id,
                            });
                            break;
                          case 'TRAVAILLE':
                            setRelationDetails({
                              ...relationDetails,
                              relatedOrganization: result.nom,
                              relatedOrganizationId: result.id,
                            });
                            break;
                          case 'ETUDE':
                            setRelationDetails({
                              ...relationDetails,
                              relatedOrganization: result.nom,
                              relatedOrganizationId: result.id,
                            });
                            break;
                          case 'AMITIE':
                            setRelationDetails({
                              ...relationDetails,
                              relatedPerson: result.nom,
                              relatedPersonId: result.id,
                            });
                            break;
                          default:
                           
                            break;
                        }
                        handleCloseSearchDialog();
                        
                      }}
                    >
                      <ListItemText
                        primary={result.nom}
                        secondary={(
                          <>
                            <Typography>ID: {result.id}</Typography>
                            <Typography>Ville: {result.ville}</Typography>
                            <Typography>Email: {result.email}</Typography>
                            {result.type === 'organization' ? (
                              <Typography>Industry: {result.industry}</Typography>
                            ) : (
                              <Typography>Status: {result.status}</Typography>
                            )}
                          </>
                        )}
                      />
                    </ListItem>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography>No results found.</Typography>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSearchDialog} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
