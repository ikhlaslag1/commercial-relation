import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress, Paper, IconButton, Table, TableBody, TableCell, TableRow, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
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
