import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, CircularProgress, Paper, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const EditRelation = () => {
  const { id } = useParams();
  const [relation, setRelation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({});
  const [newType, setNewType] = useState('');
  const [relationTypes, setRelationTypes] = useState(['TRAVAILLE', 'ETUDE', 'FAMILLE', 'COLLABORATION', 'AMITIE']); // Example types
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelationDetails = async () => {
      try {
        const response = await axios.post(`http://localhost:5000/relations/${id}`);
        console.log('API Response:', response.data);

        if (response.data && Object.keys(response.data).length > 0) {
          setRelation(response.data);
          setFormValues(response.data.relationshipProperties || {});
          setNewType(response.data.relationType || '');
        } else {
          console.warn('No relation data returned or empty data object');
          setRelation(null);
        }
      } catch (error) {
        console.error('Error fetching relation details:', error);
        setRelation(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchRelationDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleTypeChange = (e) => {
    setNewType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (newType === relation.relationType) {
        await axios.put(`http://localhost:5000/relations/update/${id}`, { type: relation.relationType, relationshipProperties: formValues });
      } else {
          await axios.put(`http://localhost:5000/relations/${id}/changeType`, { newType,relationshipProperties: formValues });
      }
      navigate(-1); 
    } catch (error) {
      console.error('Error updating relation:', error);
      alert('Failed to update relation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!relation) {
    return <Typography>Relation not found.</Typography>;
  }

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>Edit Relation</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={relation.nodeName || ''}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
       
        <TextField
          label="Associated Name"
          value={relation.relatedNodeName || ''}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Relation Type</InputLabel>
          <Select
            value={newType}
            onChange={handleTypeChange}
            label=" Relation Type"
          >
            {relationTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {newType === 'TRAVAILLE' && (
          <TextField
            label="Position"
            name="position"
            value={formValues.position || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        )}
        {newType === 'ETUDE' && (
          <>
            <TextField
              label="Field"
              name="domaine"
              value={formValues.domaine || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Level"
              name="niveau"
              value={formValues.niveau || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          </>
        )}
        {newType === 'FAMILLE' && (
          <TextField
            label="Type"
            name="type"
            value={formValues.type || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        )}
        {newType === 'COLLABORATION' && (
          <>
            <TextField
              label="Project"
              name="projet"
              value={formValues.projet || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Role"
              name="role"
              value={formValues.role || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          </>
        )}
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
          Update Relation
        </Button>
      </form>
    </Paper>
  );
};

export default EditRelation;
