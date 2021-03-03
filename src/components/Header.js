import { Container, Navbar } from 'react-bootstrap';

const Header = () => {
  return (
    <header>
      <Container fluid>
        <Navbar bg='primary' variant='dark'>
          <Navbar.Brand href='#home'>React MQTT Sample Code</Navbar.Brand>
        </Navbar>
      </Container>
    </header>
  );
};

export default Header;
