/*
 * NotFoundScreen.tsx - Not found screen for the application.
 * Copyright (C) 2024, Kieran Gordon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { FC, ReactElement } from "react";
import { Container, Col, Row } from "react-bootstrap";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";

const NotFoundScreen: FC = (): ReactElement => {
    return (
        <div id="not-found-screen" className="d-flex flex-column min-vh-100">
            <NavbarComponent />
            <Container className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <Row>
                    <Col id="about" className="text-center">
                        <h1 className="display-4">404</h1>
                    </Col>
                </Row>
                <Row>
                    <Col id="about" className="text-center">
                        <h3 className="text-center">
                            The page you are looking for does not exist.
                        </h3>
                    </Col>
                </Row>
                <Row>
                    <Col id="about" className="text-center">
                        <h3 className="text-center">
                            Please check the URL and try again.
                        </h3>
                    </Col>
                </Row>
                <Row>
                    <Col id="about" className="text-center">
                        <h5 className="text-center" style={{ color: "gray" }}>
                            Sorry :(
                        </h5>
                    </Col>
                </Row>
            </Container>
            <FooterComponent />
        </div>
    );
};

export default NotFoundScreen;