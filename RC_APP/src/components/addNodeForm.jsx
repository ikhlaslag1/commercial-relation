import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddNodeForm() {
  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    adresse: '',
    email: '',
    telephone: '', 
    age: '', 
    status: '',
    type: 'personne'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/nodes/add', formData);
      alert('Node added successfully!');
      navigate('/Personne'); 
    } catch (error) {
      console.error('Erreur lors de l\'ajout du node:', error);
      alert('Failed to add node. Please try again.');
    }
  };

  return (
    <Paper sx={{ width: "98%", overflow: "hidden", padding: "12px" }}>
      <Typography
        gutterBottom
        variant="h5"
        component="div"
        sx={{ padding: "20px" }}
      >
        <strong>Add Person</strong>
      </Typography>
      <Divider />
      <form onSubmit={handleSubmit}>
        <TextField
          name="nom"
          label="Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.nom}
          onChange={handleChange}
          required
        />
        <TextField
          name="ville"
          label="City"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.ville}
          onChange={handleChange}
          required
        />
        <TextField
          name="adresse"
          label="Address"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.adresse}
          onChange={handleChange}
          required
        />
        <TextField
          name="email"
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <TextField
          name="telephone"
          label="Telephone"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.telephone}
          onChange={handleChange}
          required
        />
        <TextField
          name="age" 
          label="Date of Birth"
          type="date"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.age}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true, // Ensures the label stays above the input
          }}
          required
        />
        <TextField
          name="status"
          label="Status"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.status}
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: '10px' }}
        >
          Add Person
        </Button>
      </form>
    </Paper>
  );
}
