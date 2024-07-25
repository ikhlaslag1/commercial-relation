import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Typography, Card, CardContent, CardHeader, Grid, Alert,
    Box, TextField, Autocomplete, IconButton, Button, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Arrow = () => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        '&::after': {
            content: '""',
            display: 'block',
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderLeft: '10px solid #3f51b5',
        }
    }} />
);

const SearchRelations = () => {
    const [nodeName1, setNodeName1] = useState('');
    const [nodeName2, setNodeName2] = useState('');
    const [persons, setPersons] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [relations, setRelations] = useState([]);
    const [error, setError] = useState('');
    const [options, setOptions] = useState([]);
    const [noRelationsFound, setNoRelationsFound] = useState(false);
    const [filterOption, setFilterOption] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [relationsPerPage, setRelationsPerPage] = useState(5);

    useEffect(() => {
        const fetchAllNodes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/nodes/all');
                if (response.data) {
                    setPersons(response.data.persons || []);
                    setOrganizations(response.data.organizations || []);
                    setOptions([...response.data.persons, ...response.data.organizations] || []);
                } else {
                    console.error('Invalid data format for nodes:', response.data);
                }
            } catch (error) {
                console.error('Error fetching all nodes:', error);
            }
        };

        fetchAllNodes();
    }, []);

    const transformRelations = (paths) => {
        return paths.map((path) => ({
            nodes: path.nodes.map((segment, index) => ({
                start: segment.start,
                end: segment.end,
                relationship: path.relationships[index] || {}
            })),
        }));
    };

    const fetchShortestPaths = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/relations/allBetween/${nodeName1}/${nodeName2}`
            );
            const transformedRelations = transformRelations(response.data);
            const uniqueRelations = removeDuplicatePaths(transformedRelations);
            setRelations(uniqueRelations);
            setNoRelationsFound(uniqueRelations.length === 0);
        } catch (error) {
            console.error('Error fetching shortest paths:', error);
            setError('Error fetching shortest paths. Please try again.');
        }
    };

    const fetchAllPaths = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/relations/paths/${nodeName1}/${nodeName2}`
            );
            const transformedRelations = transformRelations(response.data);
            const uniqueRelations = removeDuplicatePaths(transformedRelations);
            setRelations(uniqueRelations);
            setNoRelationsFound(uniqueRelations.length === 0);
        } catch (error) {
            console.error('Error fetching relations:', error);
            setError('Error fetching relations. Please try again.');
        }
    };

    const handleSearch = async () => {
        setError('');
        setCurrentPage(1); 
        if (filterOption === 'shortest') {
            await fetchShortestPaths();
        } else {
            await fetchAllPaths();
        }
    };

    const removeDuplicatePaths = (paths) => {
        const seenPaths = new Set();
        return paths.filter(path => {
            const pathString = path.nodes.map(node =>
                `${node.start.nom}-${node.end.nom}-${node.relationship.type}`).join('|');
            if (seenPaths.has(pathString)) {
                return false;
            } else {
                seenPaths.add(pathString);
                return true;
            }
        });
    };

    const indexOfLastRelation = currentPage * relationsPerPage;
    const indexOfFirstRelation = indexOfLastRelation - relationsPerPage;
    const currentRelations = relations.slice(indexOfFirstRelation, indexOfLastRelation);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Container maxWidth="lg">
            <Typography gutterBottom variant="h4" component="div" sx={{ padding: "20px", textAlign: "center", fontWeight: "bold" }}>
                Search Relations
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        flexDirection="row"
                    >
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel>Paths</InputLabel>
                            <Select
                                value={filterOption}
                                onChange={(event) => setFilterOption(event.target.value)}
                                label="Filter"
                                size="small" 
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="shortest">Shortest</MenuItem>
                            </Select>
                        </FormControl>

                        <Autocomplete
                            disablePortal
                            options={options}
                            getOptionLabel={(option) => option.nom || ''}
                            onChange={(event, newValue) => setNodeName1(newValue ? newValue.nom : '')}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Name 1" variant="outlined" size="small" />
                            )}
                            sx={{ width: 250 }}
                        />
                        <Autocomplete
                            disablePortal
                            options={options}
                            getOptionLabel={(option) => option.nom || ''}
                            onChange={(event, newValue) => setNodeName2(newValue ? newValue.nom : '')}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Name 2" variant="outlined" size="small" />
                            )}
                            sx={{ width: 250 }}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSearch}
                            aria-label="search"
                            sx={{ fontSize: 50 }}
                        >
                            <SearchIcon />
                        </IconButton>
                    </Box>
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {noRelationsFound && !error && (
                <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                    <Typography variant="body1" color="textSecondary">
                        No paths found between the selected nodes.
                    </Typography>
                </Box>
            )}

            {currentRelations.length > 0 && (
                <Grid container spacing={3} direction="row" alignItems="flex-start">
                    {currentRelations.map((relation, index) => (
                        <Grid item xs={12} key={index}>
                            <Card variant="outlined">
                                <CardHeader title={`Path ${indexOfFirstRelation + index + 1}`} />
                                <CardContent>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                        sx={{
                                            overflowX: relation.nodes.length > 4 ? 'auto' : 'hidden',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '100%' 
                                        }}
                                    >
                                        {relation.nodes.map((node, nodeIndex) => (
                                            <React.Fragment key={nodeIndex}>
                                                {nodeIndex > 0 && <Arrow />} 
                                                <Card sx={{ minWidth: 250, mr: 2, borderRadius: 2, boxShadow: 3, display: 'inline-block' }}>
                                                    <CardContent>
                                                        <Typography variant="body2">
                                                            <strong>From:</strong> {node.start.nom || 'Unknown'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>To:</strong> {node.end.nom || 'Unknown'}
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            <strong>Type:</strong> {node.relationship.type || 'Unknown'}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {relations.length > 0 && (
                <Box display="flex" justifyContent="center" mt={3}>
                    <Button
                        variant="contained"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        sx={{ mr: 1 }}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastRelation >= relations.length}
                    >
                        Next
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default SearchRelations;
