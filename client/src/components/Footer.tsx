/*
* Footer.tsx - Footer component for the application.
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

import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';

const Footer: React.FC = () => {
    return (
        <div className='footer'>
            <Container>
                <Row>
                    <Col className='text-center'>
                        <hr />
                        <Col className='py-3'>
                            <a href="https://www.gnu.org/licenses/agpl-3.0.en.html">
                                <Image src='https://www.gnu.org/graphics/agplv3-with-text-162x68.png' alt='GNU Affero General Public License v3.0' />
                            </a>
                        </Col>
                        <p>Version: {import.meta.env.VITE_VERSION} (Commit: {import.meta.env.VITE_COMMIT_HASH})</p>
                        <p className='mb-0' style={{ marginLeft: '10px' }}>&copy; {new Date().getFullYear()} Kieran Gordon &middot; Licensed under the <a href='https://www.gnu.org/licenses/agpl-3.0.en.html'>GNU Affero General Public License v3.0</a>.</p>
                        <p>Developed as part of a dissertation for <a href='https://www.hw.ac.uk/uk/schools/mathematical-computer-sciences.htm'>Heriot-Watt University&apos;s School of Mathematical and Computer Sciences</a>.</p>
                        <p>Logos courtesy of <a href='https://commons.wikimedia.org/wiki/Main_Page'>Wikimedia Commons</a>. Respective owners retain all rights, unless otherwise stated.</p>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Footer;
