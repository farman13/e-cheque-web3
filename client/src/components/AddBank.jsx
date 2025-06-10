import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const AddBank = ({ Contract }) => {

    async function Add(event) {
        event.preventDefault();//page will not reload if form get submitted

        const address = document.querySelector("#Address").value;
        await Contract.addBank(address);
        await txn.wait(); // Wait for the transaction to be mined
        console.log('Bank added:', txn);
        alert("Bank added successfully!");


    }
    return (
        <>
            <Container className="mt-5">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Form onSubmit={Add}>
                            <Form.Group controlId="Address">
                                <Form.Label>Submit your deployed Bank address</Form.Label>
                                <Form.Control type="text" placeholder="address" />
                            </Form.Group>
                            <br></br>
                            <div className="text-center">
                                <Button variant="primary" type="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default AddBank;