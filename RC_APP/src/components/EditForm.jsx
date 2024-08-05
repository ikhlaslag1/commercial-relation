import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Typography, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const EditForm = () => {
  const { type, id } = useParams();
  const [formData, setFormData] = useState({
    nom: '',
    age: '',
    ville: '',
    status: '',
    email: '',
    telephone: '',
    adresse: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNodeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/nodes/${type.toLowerCase()}/${id}`);
        const nodeData = response.data;
        setFormData({
          nom: nodeData.nom || '',
          age: nodeData.age || '',
          ville: nodeData.ville || '',
          status: nodeData.status || '',
          email: nodeData.email || '',
          telephone: nodeData.telephone || '',
          adresse: nodeData.adresse || ''
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du nœud pour l\'édition:', error);
        if (error.response) {
          console.error('Réponse de l\'API:', error.response.data);
        }
      }
    };

    fetchNodeDetails();
  }, [type, id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const formDataWithType = { ...formData, type: type.toLowerCase() };
      console.log('Submitting form with data:', formDataWithType);
      const response = await axios.put(`http://localhost:5000/nodes/edit/${id}`, formDataWithType);
      console.log('Response:', response);
      console.log('Node updated successfully');
      navigate(`/Personne`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nœud:', error);
      if (error.response) {
        console.error('Réponse de l\'API:', error.response.data);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h5" gutterBottom>Edit Person</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                type="date"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="City"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone number"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default EditForm;
