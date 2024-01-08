import React, { useEffect } from 'react';
import NavbarComponent from '../components/Navbar'
import AccountsAPI from '../api/AccountsAPI';
import VirtualMachineAPI from '../api/VirtualMachineAPI';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [hasVM, setHasVM] = React.useState(false);
    const [userVm, setUserVm] = React.useState([]);
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
                        setHasVM(true);
                        setUserVm(response.data);
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

    const DeleteVMButton = () => {
        const deleteVM = async () => {
            const response = await VirtualMachineAPI.deleteVirtualMachine(userVm.id);
            if (response.status === 200) {
                window.location.href = '/';
            }
        }
        deleteVM();
    }

    const filteredImages = images.filter((image) =>
        image.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.iso.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                    {/* Search bar form, add padding to bottom to prevent overlap with cards */}
                    {hasVM ?
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <div className='card mb-3'>
                                        <div className='card-header bg-info text-white'>
                                            <h4 className='card-title'>Virtual Machine Management</h4>
                                        </div>
                                        <div className='card-body'>
                                            {/* Display name of the VM and a description */}
                                            <h5 className='card-title'>Your Virtual Machine</h5>
                                            <p className='card-text'>You already have a virtual machine of type {userVm.iso}. You can view it or power it off below.</p>
                                            {/* Create two buttons side by side, one to view the VM and one to delete the VM */}
                                            <div className="btn-group" role="group">
                                                <button className="btn btn-primary" onClick={() => window.location.href = '/vm/'}>View</button>
                                                <button className="btn btn-danger" onClick={DeleteVMButton}>Power Off</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        // Display nothing if the user does not have a VM
                        <div></div>
                    }
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
                                            {/* If the user already has a VM, grey out the button and display a message */}
                                            {hasVM ?
                                                <button className="btn btn-secondary" disabled>VM already exists</button>
                                                :
                                                <button className="btn btn-primary" onClick={() => CreateVMButton(image.iso)}>Create VM</button>
                                            }
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