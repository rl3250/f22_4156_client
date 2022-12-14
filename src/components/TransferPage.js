import React, {useRef, useState} from 'react';
import SearchProfiles from "./SearchProfiles";
import { END_POINT } from '../utils';
import { Button, Card, Container, Form } from "react-bootstrap";
import NoticeBanner from "./NoticeBanner";

const TransferPage = (props) => {
    const [amount, setAmount] = useState(0.);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("FOOD");
    const onAmount = (e) => setAmount(e.target.value);
    const onDescription = (e) => setDescription(e.target.value);
    const onCategory = (e) => setCategory(e.target.value);
    const [notice, setNotice] = useState("");
    const [success, setSuccess] = useState("");
    const [toUid, setToUid] = useState("");
    const formRef = useRef(null);

    if (!props?.userData?.token) {
        return "Please log in first!"
    }
    const handleToUid = (toUid) => {
        setToUid(toUid)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res = await fetch(`${END_POINT}transfer/create`, {
                method: "POST",
                headers: {
                    'Authorization': props?.userData?.token
                },
                body: JSON.stringify({
                    'toUid': toUid,
                    'amount': amount,
                    'description': description,
                    'category': category,
                }),
            });
            if (res.status === 200) {
                setSuccess("Transfer completed successfully");
                setAmount(0.);  // prevents user making duplicate transfer by mistake
            } else {
                let resJson = await res.json();
                let errorFields = resJson.errorFields;
                let errorMsg = "";
                for (let i = 0; i < errorFields.length; i++) {
                    errorMsg += errorFields[i] + " ";
                }
                setNotice(errorMsg);
            }
            formRef.current.reset();
        } catch (err) {
            console.log(err);
        }
    };

    const noticeBanner = ( notice &&
        <>Transfer failed. Error fields:&nbsp;
            <span>{notice}</span>
        </>
    );

    return (
        <Container>
            <NoticeBanner children={success || noticeBanner}/>
            <Card className="shadow">
                <Card.Body>
                    <div className="mb-3 mt-md-4">
                        <h2 className="fw-bold mb-2 text-uppercase ">Make Transfer</h2>
                        <p className=" mb-5">Please enter your transfer details!</p>
                        <div className="mb-3">
                            <Form ref={formRef}>
                                <SearchProfiles handleToUid={handleToUid} currEmail={props.userData.email}/>
                                <Form.Group className="mb-3" controlId="formAmount">
                                    <Form.Label>Amount ($)</Form.Label>
                                    <Form.Control onChange={onAmount}
                                                  type="number"
                                                  min="0"
                                                  step="0.01"
                                                  placeholder="Enter amount" />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control onChange={onDescription}
                                                  type="text"
                                                  placeholder="Enter description" />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formCategory">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select value={category} onChange={onCategory}>
                                        <option value="FOOD">Food</option>
                                        <option value="TRAVEL">Travel</option>
                                        <option value="PARTY">Party</option>
                                        <option value="PHONE">Phone</option>
                                        <option value="INTERNET">Internet</option>
                                        <option value="RENT">Rent</option>
                                        <option value="SHOPPING">Shopping</option>
                                        <option value="SPORT">Sport</option>
                                        <option value="VIDEO_GAME">Video Game</option>
                                        <option value="TAXI">Taxi</option>
                                    </Form.Select>
                                </Form.Group>
                                <div className="d-grid">
                                    <Button onClick={handleSubmit} variant="primary" type="submit" disabled={!toUid || amount < 0.01 || !category}>
                                        Make Transfer
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default TransferPage