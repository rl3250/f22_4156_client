import React from 'react'
import {Navbar, Nav, Button} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import Container from 'react-bootstrap/Container';
import { Switch, Route, Link } from 'react-router-dom';
const MyNavbar = (props) => {
    const username = (
      props?.userData && <Button>{props.userData.email}</Button>
    );
    return (
      <>

      <Navbar bg="light" variant="light">
      <Container>
        <Navbar.Brand as={Link} to="/home">Ads Platform</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/manageads">Manage Ads</Nav.Link>
          <Nav.Link as={Link} to="/manageassets">Manage Assets</Nav.Link>
          <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
         
          {username ||  <Nav.Link as={Link} to="/login">Auth</Nav.Link>}
        </Nav>
      </Container>
    </Navbar>
  </>
    )
}

export default MyNavbar