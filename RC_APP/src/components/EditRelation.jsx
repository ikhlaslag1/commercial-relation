import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, CircularProgress, Paper, Typography } from '@mui/material';

const EditRelation = () => {
  const { id } = useParams();
  const [relation, setRelation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelationDetails = async () => {
      try {
        const response = await axios.post(`http://localhost:5000/relations/${id}`);
        console.log('API Response:', response.data);

        if (response.data && Object.keys(response.data).length > 0) {
          setRelation(response.data);
          setFormValues(response.data.relationshipProperties || {});
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`http://localhost:5000/relations/update/${id}`, {  type: relation.relationType,relationshipProperties: formValues });
      navigate(-1); // Go back to the previous page
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

  const { nodeName, relationType, relatedNodeName } = relation;

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>Edit Relation</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={nodeName || ''}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Relation Type"
          value={relationType || ''}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Associated Node"
          value={relatedNodeName || ''}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          margin="normal"
        />
        {relationType === 'TRAVAILLE' && (
          <TextField
            label="Position"
            name="position"
            value={formValues.position || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        )}
        {relationType === 'ETUDE' && (
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
        {relationType === 'FAMILLE' && (
          <TextField
            label="Type"
            name="type"
            value={formValues.type || ''}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        )}
        {relationType === 'COLLABORATION' && (
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
