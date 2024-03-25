<div align="center" style="margin-bottom: 20px;">
  <img src="images/logo.png" alt="Buffet Logo" width="200" height="200">
</div>

# Buffet [![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) [![GitHub issues](https://img.shields.io/github/issues/kgdn/buffet)](https://github.com/kgdn/buffet/issues) [![GitHub stars](https://img.shields.io/github/stars/kgdn/buffet)](https://github.com/kgdn/buffet/stargazers)

Buffet is a full-stack, fully-featured web-based virtual machine manager that aims to provide a free, open-source, lightweight, easy-to-use, and secure alternative to other web-based virtual machine managers such as [DistroSea](https://distrosea.com/) and [DistroTest](https://distrotest.net/).

The back-end is written in Python using the Flask web framework, and the front-end is written in React using the Bootstrap CSS framework.

Buffet was made over the course of 12 weeks as part of the final project for my bachelor's degree in Computer Systems at the [School of Mathematical and Computer Sciences](https://www.hw.ac.uk/schools/mathematical-computer-sciences.htm) at [Heriot-Watt University](https://www.hw.ac.uk/). 

**Please note that Buffet is not intended for production use, as it is still in the early stages of development.** However, you are welcome to use it for testing and development purposes. Please report any bugs or issues you encounter on the [Issues](https://github.com/kgdn/buffet/issues) page. Feel free to contribute to the project by submitting a pull request.

## Features

- Create, start, stop, and delete virtual machines
- Connect to virtual machines using [noVNC](https://github.com/novnc/noVNC), a web-based VNC client
- Manage virtual machine images, logos, and other files
- Administer users, virtual machines and logs
- Secure user authentication and authorisation using JSON Web Tokens (JWT) and bcrypt
- Lightweight and easy to install on any GNU/Linux server

## Screenshots

<div align="center">
    <img src="images/homepage.png" alt="Homepage">
    <p>The homepage</p>
</div>

<div align="center">
    <img src="images/virtual-machine-view.png" alt="Virtual Machines">
    <p>A virtual machine running Linux Mint</p>
</div>

## Installation

This section is only for people, including systems administrators, who want to install Buffet on their own servers.

### Front-end Installation

The front-end is a React application that communicates with the back-end using the REST API. It is designed to be lightweight, easy to install, and easy to use. You can install the front-end on any server that supports Node.js and npm, i.e. on Windows, macOS, or GNU/Linux.

#### Requirements

- Node.js v20.10.0 or later
- npm 10.4.0 or later

#### Instructions

1. Clone the repository:

```bash
git clone https://github.com/kgdn/buffet.git
```

2. Change into the `client` directory:
```bash
cd client
```

3. Install the required dependencies:
```bash
npm install
```

4. Create a .env file in the `client` directory with the following contents:

**`.env`**
```bash
BROWSER= # none
GENERATE_SOURCEMAP= # true or false
REACT_APP_BASE_URL= # url of api (e.g. http://localhost:)
REACT_APP_BASE_PORT= # port of api (e.g. 8000)
```

5. Start the development server (optional):
```bash
npm start
```

6. Build the production version:
```bash
npm run build
```

### Back-end Installation

The back-end is a Flask application that provides the REST API for the front-end. Unlike the front-end, the back-end is designed to be installed on a GNU/Linux server, as it makes extensive use of QEMU and KVM for virtualization. You can install the back-end on any GNU/Linux distribution that supports Python 3 and pip. Ensure that you have the required dependencies installed before proceeding.

#### Requirements

- Python 3.12.2 or later
- pip 23.2.1 or later
- venv for Python 3
- QEMU 8.1.3 or later
- Any GNU/Linux distribution for the host operating system
- Virtualization support enabled in the BIOS/UEFI settings
- KVM kernel module loaded

#### Instructions

1. Clone the repository:

```bash
git clone https://github.com/kgdn/buffet.git
```

2. Change into the `server` directory:
```bash
cd server
```

3. Create a virtual environment:
```bash
python3 -m venv .venv
```

4. Activate the virtual environment:
```bash
source .venv/bin/activate
```

5. Install the required dependencies:
```bash
pip install -r requirements.txt
```

6. Create a .env file in the `server` directory with the following contents:

**`.env`**
```bash
SECRET_KEY= # your_secret
SQLALCHEMY_DATABASE_URI= # your_database_uri
SQLALCHEMY_TRACK_MODIFICATIONS= # True or False
SQLALCHEMY_ECHO= # True or False
JWT_SECRET_KEY= # your_secret_key
JWT_COOKIE_CSRF_PROTECT= # True or False
JWT_COOKIE_SECURE= # True or False
JWT_TOKEN_LOCATION= # headers, cookies, query_string or json
JWT_ACCESS_TOKEN_EXPIRES= # access_token_expires (int)
JWT_REFRESH_TOKEN_EXPIRES= # refresh_token_expires (int)
CORS_HEADERS= # Content-Type
MAIL_SERVER= # SMTP server
MAIL_PORT= # SMTP port
MAIL_USE_TLS= # True or False
MAIL_USE_SSL= # True or False
MAIL_USERNAME= # your_email
MAIL_PASSWORD= # your_password
MAIL_DEFAULT_SENDER= # your_email
MAIL_MAX_EMAILS= # max_emails (int)
MAIL_ASCII_ATTACHMENTS= # True or False
```

7. Start the development server (optional):
```bash
flask -A app run
```

8. Run the production server:
```bash
gunicorn --bind 0.0.0.0:8000 --workers 4 app:app
```