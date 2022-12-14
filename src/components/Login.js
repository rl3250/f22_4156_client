import { Col, Button, Row, Container, Card, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import NoticeBanner from "./NoticeBanner";
import { useNavigate } from "react-router-dom";
import CLIENT from '../CLIENT';
import { APIs } from "../api";

export default function Login(props) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const onEmail = (e) => setEmail(e.target.value);
    const onPassword = (e) => setPassword(e.target.value);
    const [notice, setNotice] = useState();
    const [success, setSuccess] = useState();

    useEffect(() => {
        async function fetchProfile() {
          const rsp = await APIs.getProfile();
          console.log(rsp);
          props?.setProfile(rsp);
          localStorage.setItem('profile',JSON.stringify(rsp));
        }
        fetchProfile();
    }, [setSuccess, props?.userData]);
    const handleLogin = async (e) => {
        e.preventDefault();
        const payload = {
            "email" : email,
            "password" : password,
        }
        
        try {
            CLIENT.post("auth/login", payload)
            .then((rsp) => {                
                if (rsp.data?.message){
                    setNotice(rsp.data);
                } else if (rsp.data?.token) {
                    // success login
                    setSuccess("successfully logged in!");
                    const user = {
                        'email' : email,
                        'token': rsp.data?.token
                    }
                    props?.setUserData(user);
                    localStorage.setItem("userData", JSON.stringify(user));
                } else {
                    setNotice('Err when logging in.')
                }

            }).catch(function (error) {
                if (error.status === 400) {
                    setNotice("Fail to login")
                } else {
                    setNotice(error)
                }
        
            });
        }
        catch (err){
            console.log(err);
        }
    }
    const noticeBanner = ( notice && 
        <>Error fields: <span>{notice?.errorFields
?.join()} </span>
        - {notice?.message} 
        </>
    );
  return (
    <div>
        
      <Container>
          <NoticeBanner children={success || noticeBanner}/>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={8} lg={6} xs={12}>
            { props?.userData == null ? 
            <>
            <div className="border border-3 border-primary"></div>
            <Card className="shadow">
              <Card.Body>
                <div className="mb-3 mt-md-4">
                  <h2 className="fw-bold mb-2 text-uppercase ">Zenmo Money service</h2>
                  <p className=" mb-5">Please enter your email and password!</p>
                  <div className="mb-3">
                    <Form>
                      <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label className="text-center">
                          Email address
                        </Form.Label>
                        <Form.Control onChange={onEmail} type="email" placeholder="Enter email" />
                      </Form.Group>

                      <Form.Group
                        className="mb-3"
                        controlId="formPassword"
                      >
                        <Form.Label>Password</Form.Label>
                        <Form.Control onChange={onPassword} type="password" placeholder="Password" />
                      </Form.Group>
                      <div className="d-grid">
                        <Button onClick={handleLogin} variant="primary" type="submit">
                          Login
                        </Button>
                      </div>
                    </Form>
                    <div className="mt-3">
                      <p className="mb-0  text-center">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-primary fw-bold">
                          Sign Up
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card> </>: <>You are already logged in.</>
            }
          </Col>
        </Row>
      </Container>
    </div>
  );
}