import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Select, MenuItem, Button, FormControl, InputLabel, CircularProgress, Typography, Box } from '@mui/material';

const AssociateForm = () => {
  const { id, type: rawType } = useParams();
  const type = rawType.toLowerCase();
  const [selectedNode, setSelectedNode] = useState(null);
  const [associationType, setAssociationType] = useState('');
  const [nodesList, setNodesList] = useState({ personnes: [], organizations: [] });
  const [relationType, setRelationType] = useState('');
  const [relationDetails, setRelationDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchSelectedNode();
        await fetchNodesList();
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  const fetchSelectedNode = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/nodes/${type}/${id}`);
      setSelectedNode(response.data);
    } catch (error) {
      console.error('Error fetching selected node:', error);
    }
  };

  const fetchNodesList = async () => {
    try {
      const [personnesResponse, organizationsResponse] = await Promise.all([
        axios.get('http://localhost:5000/nodes/pers'),
        axios.get('http://localhost:5000/nodes/org')
      ]);
      setNodesList({
        personnes: personnesResponse.data.personnes,
        organizations: organizationsResponse.data.organizations
      });
    } catch (error) {
      console.error('Error fetching nodes list:', error);
    }
  };

  const handleAssociationTypeChange = (event) => {
    setAssociationType(event.target.value);
    setRelationType(''); 
  };

  const handleRelationTypeChange = (event) => {
    setRelationType(event.target.value);
  };

  const handleRelationDetailsChange = (event) => {
    setRelationDetails({
      ...relationDetails,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
 
    if (!relationType || !associationType) {
      alert('Please select relation type and association type.');
      return;
    }
 
    const relation = {
      type: relationType,
      params: {
        person: selectedNode.type === 'Personne' ? selectedNode.nom : undefined,
        organization: selectedNode.type === 'Organization' ? selectedNode.nom : undefined,
        relatedPerson: associationType === 'Personne' ? relationDetails.personne : undefined,
        relatedOrganization: associationType === 'Organization' ? relationDetails.organization : undefined,
        domaine: relationType === 'ETUDE' ? relationDetails.field : undefined,
        niveau: relationType === 'ETUDE' ? relationDetails.level : undefined,
        position: relationType === 'TRAVAILLE' ? relationDetails.position : undefined,
        type: relationType === 'FAMILLE' ? relationDetails.type : undefined,
        projet: relationType === 'COLLABORATION' ? relationDetails.project : undefined,
        role: relationType === 'COLLABORATION' ? relationDetails.role : undefined,
      }
    };
    try {
      await axios.post('http://localhost:5000/relations/add', relation);
      alert('Relation created successfully!');
      navigate('/Organization');
    } catch (error) {
      console.error('Error creating relation:', error);
    }
  };

  const getRelationTypeOptions = () => {
    if (selectedNode && associationType) {
      if (selectedNode.type === 'Personne') {
        return associationType === 'Personne' 
          ? ['FAMILLE', 'AMITIE'] 
          : ['TRAVAILLE', 'ETUDE'];
      } else if (selectedNode.type === 'Organization') {
        return associationType === 'Organization'
          ? ['COLLABORATION']
          : ['TRAVAILLE', 'ETUDE'];
      }
    }
    return [];
  };

  const renderRelationDetails = () => {
    switch (relationType) {
      case 'TRAVAILLE':
        return (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Position"
              name="position"
              value={relationDetails.position || ''}
              onChange={handleRelationDetailsChange}
            />
          </Box>
        );
      case 'ETUDE':
        return (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Field"
              name="field"
              value={relationDetails.field || ''}
              onChange={handleRelationDetailsChange}
            />
            <TextField
              fullWidth
              label="Level"
              name="level"
              value={relationDetails.level || ''}
              onChange={handleRelationDetailsChange}
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case 'FAMILLE':
        return (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Type"
              name="type"
              value={relationDetails.type || ''}
              onChange={handleRelationDetailsChange}
            />
          </Box>
        );
      case 'COLLABORATION':
        return (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Project"
              name="project"
              value={relationDetails.project || ''}
              onChange={handleRelationDetailsChange}
            />
            <TextField
              fullWidth
              label="Role"
              name="role"
              value={relationDetails.role || ''}
              onChange={handleRelationDetailsChange}
              sx={{ mt: 2 }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box p={2}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          {selectedNode ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Selected Node: {selectedNode.nom}
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Associate With</InputLabel>
                <Select
                  value={associationType}
                  onChange={handleAssociationTypeChange}
                  label="Associate With"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Personne">Personne</MenuItem>
                  <MenuItem value="Organization">Organization</MenuItem>
                </Select>
              </FormControl>
              {associationType === 'Personne' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Personne to Associate</InputLabel>
                  <Select
                    name="personne"
                    onChange={handleRelationDetailsChange}
                    label="Select Personne to Associate"
                  >
                    <MenuItem value="">Select</MenuItem>
                    {nodesList.personnes.map(person => (
                      <MenuItem key={person.id} value={person.nom}>
                        {person.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {associationType === 'Organization' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select Organization to Associate</InputLabel>
                  <Select
                    name="organization"
                    onChange={handleRelationDetailsChange}
                    label="Select Organization to Associate"
                  >
                    <MenuItem value="">Select</MenuItem>
                    {nodesList.organizations.map(org => (
                      <MenuItem key={org.id} value={org.nom}>
                        {org.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl fullWidth margin="normal">
                <InputLabel>Type of Relationship</InputLabel>
                <Select
                  value={relationType}
                  onChange={handleRelationTypeChange}
                  label="Type of Relationship"
                >
                  <MenuItem value="">Select</MenuItem>
                  {getRelationTypeOptions().map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {renderRelationDetails()}
              <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                Submit
              </Button>
            </Box>
          ) : (
            <Typography>No node selected.</Typography>
          )}
        </form>
      )}
    </Box>
  );
};

export default AssociateForm;
