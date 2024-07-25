import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Typography, CircularProgress, Paper, IconButton, Table, TableBody, TableCell, TableRow, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NodeDetails = () => {
  const { type, id } = useParams();
  const [node, setNode] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNodeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/nodes/${type.toLowerCase()}/${id}`);
        setNode(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du nœud:', error);
        if (error.response) {
          console.error('Réponse de l\'API:', error.response.data);
        }
      }
    };

    fetchNodeDetails();
  }, [type, id]);

  const handleEditClick = () => {
    navigate(`/edit/${type.toLowerCase()}/${id}`);
  };

  const handleDeleteClick = async () => {
    try {
      await axios.delete(`http://localhost:5000/nodes/delete/${type.toLowerCase()}/${id}`);
      console.log('Node deleted successfully');
      navigate('/Person'); 
    } catch (error) {
      console.error('Error deleting node:', error);
    }
  };

  const handleViewRelationDetails = (relation) => {
    setSelectedRelation(relation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRelation(null);
  };

  const renderRelationDetails = (relation) => {
    if (!relation || !relation.relationshipProperties) {
      return null;
    }
  
    const props = relation.relationshipProperties;
  
    switch (relation.relationType) {
      case 'TRAVAILLE':
        return (
          <>
            <TableRow>
              <TableCell><strong>Position:</strong></TableCell>
              <TableCell>{props.position}</TableCell>
            </TableRow>
          </>
        );
      case 'ETUDE':
        return (
          <>
            <TableRow>
              <TableCell><strong>Field:</strong></TableCell>
              <TableCell>{props.domaine}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Level:</strong></TableCell>
              <TableCell>{props.niveau}</TableCell>
            </TableRow>
          </>
        );
      case 'FAMILLE':
        return (
          <>
            <TableRow>
              <TableCell><strong>Type:</strong></TableCell>
              <TableCell>{props.type}</TableCell>
            </TableRow>
          </>
        );
      case 'COLLABORATION':
        return (
          <>
            <TableRow>
              <TableCell><strong>Project:</strong></TableCell>
              <TableCell>{props.projet}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Role:</strong></TableCell>
              <TableCell>{props.role}</TableCell>
            </TableRow>
          </>
        );
      default:
        return null;
    }
  };
  

  return (
    <div style={{ padding: '20px' }}>
      {node ? (
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom>Person Details</Typography>
          <Grid container spacing={3}>
            {/* Node Details */}
            <Grid item xs={12}>
              <Paper elevation={1} style={{ padding: '20px' }}>
                <Typography variant="h6" gutterBottom>Details</Typography>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>ID:</strong></TableCell>
                      <TableCell>{node.id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Name:</strong></TableCell>
                      <TableCell>{node.nom}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Age:</strong></TableCell>
                      <TableCell>{node.age}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>City:</strong></TableCell>
                      <TableCell>{node.ville}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Status:</strong></TableCell>
                      <TableCell>{node.status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Email:</strong></TableCell>
                      <TableCell>{node.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Phone number:</strong></TableCell>
                      <TableCell>{node.telephone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Address:</strong></TableCell>
                      <TableCell>{node.adresse}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <IconButton onClick={handleEditClick} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleDeleteClick} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h6" gutterBottom>Relations</Typography>
                <Table>
                  <TableBody>
                    {node.relations && node.relations.length > 0 ? (
                      node.relations.map((relation, index) => (
                        <TableRow key={index}>
                          <TableCell><strong>Type:</strong></TableCell>
                          <TableCell>{relation.relationType}</TableCell>
                          <TableCell><strong>With:</strong></TableCell>
                          <TableCell>{relation.relatedNodeName}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleViewRelationDetails(relation)} color="info">
                              <InfoIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5}>No relations found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>

          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Relation Details</DialogTitle>
            <DialogContent>
              {selectedRelation && (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Type:</strong></TableCell>
                      <TableCell>{selectedRelation.relationType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Related Node:</strong></TableCell>
                      <TableCell>{selectedRelation.relatedNodeName}</TableCell>
                    </TableRow>
                    {renderRelationDetails(selectedRelation)}
                  </TableBody>
                </Table>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        </Paper>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default NodeDetails;
