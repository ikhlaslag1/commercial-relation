import React from 'react';
import Home from "./pages/Home";
import Nodes from "./pages/Node";
import OrganizationList from "./pages/Organization";
import NodeDetails from "./pages/relationsDetails";
import AddNode from "./pages/addNode"; 
import EditNode from "./pages/editNode";
import EditOrg from "./pages/editOrg";
import AssociateNode from "./pages/Associate";
import AddOrganization from "./pages/addOrganization";
import Search from './pages/searchRelation';
import Relation from './pages/Relation';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import EditRelation from './pages/editRelation';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/Personne" element={<Nodes />} />
        <Route path="/relations/:type/:id" element={<NodeDetails />} />
        <Route path="/add_Person" element={<AddNode />} /> 
        <Route path="/add_Organization" element={<AddOrganization />} />
        <Route path="/edit/:type/:id" element={<EditNode />} />
        <Route path="/edit_Org/:type/:id" element={<EditOrg />} />
        <Route path="/EditRelation/:id" element={<EditRelation />} />
        <Route path="/Organization" element={<OrganizationList />} />
        <Route path="/associate/:id/:type" element={<AssociateNode />} />
        <Route path="/search" element={<Search />} />
        <Route path="/Relations" element={<Relation />} />
      </Routes>
    </BrowserRouter>
  );
}
