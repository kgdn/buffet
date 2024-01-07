import React from 'react';
import NavbarComponent from '../components/Navbar'
import AccountsAPI from '../api/AccountsAPI';
import VirtualMachineAPI from '../api/VirtualMachineAPI';
import 'bootstrap/dist/css/bootstrap.min.css';

// Render a list of VMs from the database (test with vms.json)
// Each VM should have a button that redirects to the VMView screen
// Add a boostrap Card component to display each operating system

function Home() {
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [images, setImages] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    // Check if the user is logged in on page load, only run once, do not use async/await
    // If the user is logged in, get the list of images from the API
    React.useEffect(() => {
        AccountsAPI.checkLogin().then((response) => {
            if (response.status === 200) {
                setLoggedIn(true);
                VirtualMachineAPI.getAllImages().then((response) => {
                    setImages(response.data);
                });
            }
        });
    }, []);

    const CreateVMButton = (iso) => {
        // Create a new virtual machine
        // If the response is successful, redirect to the VMView screen
        // If the response is unsuccessful, display the error message
        const createVM = async () => {
            const response = await VirtualMachineAPI.createVirtualMachine(iso);
            if (response.status === 201) {
                window.location.href = '/vm/' + response.data.user_id;
            }
        }
        createVM();
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
                    <div className="container">
                        <div className="row">
                            <div className="col" id="about">
                                <h1>Operating Systems</h1>
                                <p>Choose an operating system to get started.</p>
                            </div>
                        </div>
                    </div>
                    {/* Search bar form, add padding to bottom to prevent overlap with cards */}
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
                                <div className="col-sm-4" style={{ paddingBottom: 20 }}>
                                    <div className="card">
                                        <div className="card-body" key={image.id}>
                                            <h5 className="card-title">{image.name} {image.version}</h5>
                                            <p className="card-text">{image.iso}</p>
                                            <p className="card-text">{image.description}</p>
                                            {/* Use CreateVMButton component to create a new VM, use the image id as the iso */}
                                            <button className="btn btn-primary" onClick={() => CreateVMButton(image.iso)}>Create VM</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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