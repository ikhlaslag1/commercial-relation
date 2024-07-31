import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress, Paper, IconButton, Table, TableBody, TableCell, TableRow, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Info as InfoIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NodeDetails = () => {
  const { type, id } = useParams();
  const [node, setNode] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [relationToDelete, setRelationToDelete] = useState(null);
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

  const handleViewRelationDetails = (relation) => {
    setSelectedRelation(relation);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRelation(null);
  };

  const handleEditRelation = (relation) => {
    navigate(`/EditRelation/${relation.relationId}`);
  };

  const handleOpenConfirmDialog = (relation) => {
    setRelationToDelete({
      id: relation.relationId,
      relationType: relation.relationType,
    });
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setRelationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (relationToDelete) {
      try {
        await axios.delete(`http://localhost:5000/relations/delete/${relationToDelete.id}`, {
          data: { type: relationToDelete.relationType }
        });
        // Re-fetch the node details
        const response = await axios.get(`http://localhost:5000/nodes/${type.toLowerCase()}/${id}`);
        setNode(response.data);
        handleCloseConfirmDialog();
      } catch (error) {
        console.error('Erreur lors de la suppression de la relation:', error);
      }
    }
  };

  const renderRelationDetails = (relation) => {
    if (!relation || !relation.relationshipProperties) {
      return null;
    }

    const props = relation.relationshipProperties;

    return (
      <>
        <TableRow>
          <TableCell><strong>Relation ID:</strong></TableCell>
          <TableCell>{relation.relationId}</TableCell>
        </TableRow>
        {relation.relationType === 'TRAVAILLE' && (
          <TableRow>
            <TableCell><strong>Position:</strong></TableCell>
            <TableCell>{props.position}</TableCell>
          </TableRow>
        )}
        {relation.relationType === 'ETUDE' && (
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
        )}
        {relation.relationType === 'FAMILLE' && (
          <TableRow>
            <TableCell><strong>Type:</strong></TableCell>
            <TableCell>{props.type}</TableCell>
          </TableRow>
        )}
        {relation.relationType === 'COLLABORATION' && (
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
        )}
      </>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {node ? (
        <Paper elevation={3} style={{ padding: '20px' }}>
          <Typography variant="h5" gutterBottom>Relations</Typography>
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
                      <IconButton onClick={() => handleViewRelationDetails(relation)} style={{ color: "green" }}>
                        <InfoIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditRelation(relation)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenConfirmDialog(relation)} color="error">
                        <DeleteIcon />
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

          {/* Relation Details Dialog */}
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Relation Details</DialogTitle>
            <DialogContent>
              {selectedRelation && (
                <Table>
                  <TableBody>
                    {renderRelationDetails(selectedRelation)}
                  </TableBody>
                </Table>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
          </Dialog>

          {/* Confirm Delete Dialog */}
          <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
            <DialogTitle>Delete confirmation</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this relationship?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseConfirmDialog} color="primary">Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">Delete</Button>
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
