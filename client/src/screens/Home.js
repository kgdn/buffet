import React, { useEffect } from 'react';
import NavbarComponent from '../components/Navbar'
import AccountsAPI from '../api/AccountsAPI';
import VirtualMachineAPI from '../api/VirtualMachineAPI';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [images, setImages] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    useEffect(() => {
        document.title = 'Buffet - Home';
    }, []);

    // Check if the user is logged in on page load, only run once, do not use async/await
    // If the user is logged in, get the list of images from the API
    useEffect(() => {
        AccountsAPI.getUserDetails().then((response) => {
            if (response.status === 200) {
                setLoggedIn(true);
                VirtualMachineAPI.getAllImages().then((response) => {
                    if (response.status === 200) {
                        setImages(response.data);
                    }
                }
                );
                VirtualMachineAPI.getVirtualMachineByUser(response.data.id).then((response) => {
                    // Get the link to the VM if it exists
                    if (response.status === 200) {
                        window.location.href = '/vm/';
                    }
                }
                );
            }
        });
    }, []);


    // Create a new VM using the VirtualMachineAPI
    // If the response is successful, redirect to the VirtualMachineView screen
    const CreateVMButton = (iso) => {
        const createVM = async () => {
            const response = await VirtualMachineAPI.createVirtualMachine(iso);
            if (response.status === 201) {
                window.location.href = '/vm/'
            }
        }
        createVM();
    }

    const filteredImages = images.filter((image) =>
        image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.iso.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.name.toLowerCase().concat(' ', image.version.toLowerCase()).includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div>
                <NavbarComponent />
                <div className="container">
                    <div className="row">
                        <div className="col" id="about">
                            <h1>Buffet</h1>
                            <p>Buffet is a web-based virtual machine manager that allows you to try various GNU/Linux distributions in your browser.</p>
                            <p>Buffet is currently in development.</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hide the rest of the page if the user is not logged in */}
            {loggedIn ?
                <div>
                    {/* Display the list of operating systems */}
                    <div className="container">
                        <div className="row">
                            <div className="col" id="about">
                                <h1>Operating Systems</h1>
                                <p>Choose an operating system to get started.</p>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <form className="form-inline">
                                    <input className="form-control mb-3" type="search" placeholder="Search" aria-label="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row">
                            {filteredImages.map((image) => (
                                <div key={image.name} className="col-12 col-md-6 col-lg-4" style={{ paddingBottom: '1rem' }}>
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">{image.name} {image.version}</h5>
                                            <p className="card-text">{image.desktop}</p>
                                            <p className="card-text">{image.description}</p>
                                        </div>
                                        <div className="card-footer">
                                            <button className="btn btn-primary" onClick={() => CreateVMButton(image.iso)}>Create VM</button>
                                        </div>
                                    </div>
                                </div>
                                // sort alphabetically
                            )).sort((a, b) => a.key.localeCompare(b.key))}
                        </div>
                    </div>
                </div>
                :
                // Display text prompting the user to log in
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <p>You can create an account or login <a href="/login">here</a>.</p>
                        </div>
                    </div>
                </div>
            }
        </div >
    );
}

export default Home;