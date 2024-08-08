import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography
} from "@mui/material";

export default function SearchResultsDialog({ open, onClose, results }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Search Results</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {results.map((result, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{result.name}</Typography>
                  <Typography variant="body2">{result.details}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
