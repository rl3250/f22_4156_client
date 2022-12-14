import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import { Card, Container, Form, ListGroup }  from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import CLIENT from '../CLIENT';
import NoticeBanner from "./NoticeBanner";
import { APIs } from '../api';

const UserProfilePage = (props) => {
    const profile = props.profile;
    const setProfile = props.setProfile;
    const [amount, setAmount] = useState(0.);
    const [adsPayload, setAdsPayload] = useState(null);
    const onAmount = (e) => setAmount(e.target.value);
    const [notice, setNotice] = useState("");
    async function fetchProfile() {
        const rsp = await APIs.getProfile();
        console.log(rsp);
        props?.setProfile(rsp);
        localStorage.setItem('profile',JSON.stringify(rsp));
      }
    useEffect(() => { 
        if (!profile) {
        fetchProfile();
        }
    },[amount, setAdsPayload]);

    if (!props?.userData?.token) {
        return "Please log in first!"
    }

    const handleBalanceUpdateSubmission = async (e) => {
        e.preventDefault();
        const isDeposit = e.currentTarget.id === "depositBtn";
        const payload = {
            "amount": isDeposit ? amount : -amount,
        }
        try {
            CLIENT.put("balance", payload, {
                headers: {
                    'Authorization': props?.userData?.token
                }
            })
            .then(rsp => {
                setProfile(null);
                setAmount(0.);
                setNotice(isDeposit ? "Deposited successfully!" : "Withdrew successfully!");
            }).catch(err => {
                setNotice(err.response?.data?.error);
                console.log(err);
            })
        } catch (err) {
            console.log(err);
        }
    }

    const onEditAds = (e) => {
        setAdsPayload({
            "promotionText": e.target.value
        });
    }

    const handleAdsSubmit = async (e) => {
        e.preventDefault();
        try {
            CLIENT.put("ads", adsPayload, {
                headers: {
                    'Authorization': props?.userData?.token
                }
            })
            .then(rsp => {
                setProfile(null);
                setAmount(0.);
                setNotice("Your advertisement was updated successfully!");
                fetchProfile();
            }).catch(err => {
                setNotice(err);
                console.log(err);
            })
        } catch (err) {
            setNotice(err);
            console.log(err);
        }
    };

    const isTooSmall = amount < 0.01;

    return (
        <Container>
            <NoticeBanner children={notice}/>
            <Card className="shadow">
                <Card.Body>
                    <div className="mb-3 mt-md-4">
                        <h2 className="fw-bold mb-2 text-uppercase">My Profile</h2>
                        { profile === null ? "loading" : (
                            <>
                                <ListGroup>
                                    <ListGroup.Item>User ID: {profile.id}</ListGroup.Item>
                                    <ListGroup.Item>Email: {profile.email}</ListGroup.Item>
                                    {profile.phone && <ListGroup.Item>Phone: {profile.phone}</ListGroup.Item>}
                                    <ListGroup.Item>User Type: {profile.type.toLowerCase()}</ListGroup.Item>
                                    <ListGroup.Item>Account Name: {profile.accountName}</ListGroup.Item>
                                    <ListGroup.Item>Account Number: {profile.accountNumber}</ListGroup.Item>
                                    <ListGroup.Item>Routing Number: {profile.routingNumber}</ListGroup.Item>
                                    <ListGroup.Item>Balance: ${profile.balance.toFixed(2)}</ListGroup.Item>
                                </ListGroup>
                                <ButtonToolbar className="mb-3" aria-label="Toolbar with Button groups">
                                    <InputGroup>
                                        <InputGroup.Text id="btnGroupAddon">$</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="99999999999999999"
                                            placeholder="Enter the amount here"
                                            aria-label="Amount form"
                                            aria-describedby="btnGroupAddon"
                                            onChange={onAmount}
                                        />
                                        <Button 
                                            variant="outline-secondary"
                                            disabled={isTooSmall} 
                                            id="depositBtn"
                                            onClick={handleBalanceUpdateSubmission}
                                        >
                                            Deposit
                                        </Button>
                                        <Button 
                                            variant="outline-secondary"
                                            disabled={isTooSmall || amount > parseFloat(profile.balance.toFixed(2))}
                                            id="withdrawBtn"
                                            onClick={handleBalanceUpdateSubmission}
                                        >
                                            Withdraw
                                        </Button>
                                    </InputGroup>
                                </ButtonToolbar>

                                {profile.type === "BUSINESS" && (
                                    <Form.Group
                                        className="mb-3"
                                        controlId="formAds"
                                    >
                                        <Form.Label>Edit Your Advertisement</Form.Label>
                                        <Form.Control onChange={onEditAds} type="text" defaultValue={profile.bizPromotionText} />
                                        <Button 
                                            variant="outline-secondary"
                                            disabled={!adsPayload}
                                            id="adsBtn"
                                            onClick={handleAdsSubmit}
                                        >
                                            Update
                                        </Button>
                                    </Form.Group>
                                )}
                            </>
                        )}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    )
}
export default UserProfilePage