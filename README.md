<div align="center" style="margin-bottom: 20px;">
  <img src="images/logo.png" alt="Buffet Logo" width="200" height="200">
</div>

# Buffet [![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) [![GitHub issues](https://img.shields.io/github/issues/kgdn/buffet)](https://github.com/kgdn/buffet/issues) [![GitHub stars](https://img.shields.io/github/stars/kgdn/buffet)](https://github.com/kgdn/buffet/stargazers)

Buffet is a full-stack, fully-featured web-based virtual machine manager that aims to provide a free, open-source, lightweight, easy-to-use, and secure alternative to other web-based virtual machine managers such as [DistroSea](https://distrosea.com/) and [DistroTest](https://www.reddit.com/r/DistroHopping/comments/wqrwbw/what_happened_to_distrotestnet/).
The back-end is written in Python using the [Flask](https://github.com/pallets/flask) web framework, and the front-end is written in JavaScript with the [React](https://github.com/facebook/react) library. Buffet uses [QEMU](https://github.com/qemu/qemu) and [KVM](https://www.linux-kvm.org/) for virtualization, and [noVNC](https://github.com/novnc/noVNC) + [websockify](https://github.com/novnc/websockify) for remote desktop access.

Buffet was made over the course of 12 weeks as part of the final project for my bachelor's degree in Computer Systems at the [School of Mathematical and Computer Sciences](https://www.hw.ac.uk/schools/mathematical-computer-sciences.htm) at [Heriot-Watt University](https://www.hw.ac.uk/). 

> [!IMPORTANT]
> **Please note that Buffet is not intended for production use, as it is still in the early stages of development.** 
>
> However, you are welcome to use it for testing and development purposes. Please report any bugs or issues you encounter on the [Issues](https://github.com/kgdn/buffet/issues) page. Feel free to contribute to the project by submitting a pull request.

## Features

- Create, start, and delete QEMU/KVM virtual machines
- Access virtual machines securely using noVNC, websockify with SSL/TLS support, and randomly generated, one time VNC passwords
- Define custom operating systems and distributions using JSON
- Administer users, virtual machines and logs from the admin panel
- Secure user authentication and authorisation using JSON Web Tokens (JWT) and bcrypt
- Email-based account verification
- Lightweight, easy-to-setup back-end using Flask and SQLAlchemy
- Supports any SQL database supported by SQLAlchemy, such as SQLite, PostgreSQL, MySQL, and MariaDB
- Runs on GNU/Linux servers with QEMU and KVM support
- Fully responsive front-end that works on desktops, tablets, and smartphones

## Screenshots

<div align="center">
    <img src="images/homepage.png" alt="Homepage">
    <p>The dashboard showing the virtual machines</p>
</div>

<div align="center">
    <img src="images/virtual-machine-view.png" alt="Virtual Machines">
    <p>A virtual machine running Linux Mint</p>
</div>

## Installation

This section is only for people, including systems administrators, who want to install Buffet on their own servers.

### Front-end Installation

The front-end is a React application that communicates with the back-end using the REST API. It is designed to be lightweight, easy to install, and easy to use. 

> [!NOTE]
> You can install the front-end on any server that supports Node.js and npm, i.e. on Windows, macOS, or GNU/Linux.

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
VITE_BASE_URL= # url of api (e.g. https://localhost)
VITE_BASE_PORT= # port of api (e.g. 8000)
VITE_MAX_VM_COUNT= # max no. of virtual machines available at any given time
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

The back-end is a Flask application that provides the REST API for the front-end. 

> [!NOTE]
> Unlike the front-end, the back-end is designed to be installed on a GNU/Linux server, as it makes extensive use of QEMU and KVM for virtualization. You can install the back-end on any GNU/Linux distribution that supports Python 3 and pip. Ensure that you have the required dependencies installed before proceeding.

#### Requirements

- Python 3.12.2 or later
- pip 23.2.1 or later
- venv for Python 3
- QEMU 8.1.3 or later
- Any GNU/Linux distribution for the host operating system
- Virtualization support enabled in the BIOS/UEFI settings
- KVM kernel module loaded

> [!TIP]
> You can check if the KVM kernel module is loaded by running the following command:

```bash
lsmod | grep kvm
```

You should see output similar to the following:

```bash
kvm_intel             425984  0
kvm_amd                98304  0
kvm                  1376256  1 kvm_intel
irqbypass              12288  1 kvm
```

If you do not see any output, you may need to load the KVM kernel module manually:

```bash
sudo modprobe kvm
```

#### Database Setup

Buffet uses SQLAlchemy to interact with the database. A database is required to store user information and virtual machine information. You can use any SQL database supported by SQLAlchemy, such as SQLite, PostgreSQL, MySQL, and MariaDB.

- To use SQLite, you can set the `SQLALCHEMY_DATABASE_URI` variable in the `.env` file to `sqlite:///db.sqlite3`. This requires no additional setup.

- To use PostgreSQL, you can set the `SQLALCHEMY_DATABASE_URI` variable in the `.env` file to `postgresql://username:password@localhost/dbname`. This assumes that you have a PostgreSQL database running on your server. You may need to install the `psycopg2` package using pip. **This is the recommended database for production use.**
  
- To use MySQL/MariaDB, you can set the `SQLALCHEMY_DATABASE_URI` variable in the `.env` file to `mysql://username:password@localhost/dbname`. This assumes that you have a MySQL database running on your server. You may need to install the `mysql-connector-python` package using pip.

 
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
SECRET_KEY= # your secret
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
MAIL_USERNAME= # your email
MAIL_PASSWORD= # your password
MAIL_DEFAULT_SENDER= # your email
MAIL_MAX_EMAILS= # max_emails (int)
MAIL_ASCII_ATTACHMENTS= # True or False
FRONT_END_ADDRESS= # localhost, 127.0.0.1, etc.
BACK_END_ADDRESS= # localhost, 127.0.0.1, etc.
SSL_CERTIFICATE_PATH= # path_to_ssl_certificate
SSL_KEY_PATH= # path_to_ssl_key
GUNICORN_BIND_ADDRESS= # bind address, i.e. 0.0.0.0:8000
GUNICORN_WORKER_CLASS= # worker class, i.e. gevent
MAX_VM_COUNT= # max no. of virtual machines available at any given time
```

7. Put your virtual machine images in the `iso` directory, and create an `index.json` file in the `iso` directory with the following structure:
```jsonc
[
    {
        "iso": "archlinux.iso", // name of the ISO file
        "desktop": "No desktop", // desktop environment
        "name": "Arch Linux", // name of the distribution
        "version": "Latest", // version of the distribution
        "description": "Bleeding edge GNU/Linux distribution where you build your own system from the ground up, tailored to your needs.", // description of the distribution
        "linux": true, // whether the distribution uses the Linux kernel or not
        "logo": "archlinux.png", // name of the logo file found in the iso/logos directory
        "homepage": "https://archlinux.org", // homepage of the distribution
        "beginner_friendly": false // whether the distribution is beginner-friendly or not
    }, // add more distributions here
]
```

8. Create a `logos` directory in the `iso` directory and put your distribution logos in it.
```bash
mkdir iso/logos
mv archlinux.png iso/logos
```

9. Start the development server (optional):
```bash
flask -A app run
```

10. Run the production server (recommended):
```bash
gunicorn app:app
```

## Third-party Libraries and Dependencies

Buffet uses the following third-party libraries and dependencies:

### Fonts

1. [Open Sans](https://fonts.google.com/specimen/Open+Sans) (Apache License 2.0)

### Icons

1. [Bootstrap Icons](https://icons.getbootstrap.com/) (MIT License)

### UI Components

1. [Bootstrap](https://getbootstrap.com/) (MIT License)

### Front-end Dependencies

1. [@novnc/novnc](https://www.npmjs.com/package/@novnc/novnc) (MPL-2.0 License)
2. [@testing-library/jest-dom](https://www.npmjs.com/package/@testing-library/jest-dom) (MIT License)
3. [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) (MIT License)
4. [@testing-library/user-event](https://www.npmjs.com/package/@testing-library/user-event) (MIT License)
5. [@types/jest](https://www.npmjs.com/package/@types/jest) (MIT License)
6. [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) (MIT License)
7. [axios](https://www.npmjs.com/package/axios) (MIT License)
8. [bootstrap](https://www.npmjs.com/package/bootstrap) (MIT License)
9. [bootstrap-icons](https://www.npmjs.com/package/bootstrap-icons) (MIT License)
10. [password-validator](https://www.npmjs.com/package/password-validator) (MIT License)
11. [prop-types](https://www.npmjs.com/package/prop-types) (MIT License)
12. [react](https://www.npmjs.com/package/react) (MIT License)
13. [react-bootstrap](https://www.npmjs.com/package/react-bootstrap) (MIT License)
14. [react-dom](https://www.npmjs.com/package/react-dom) (MIT License)
15. [react-responsive](https://www.npmjs.com/package/react-responsive) (MIT License)
16. [react-router-dom](https://www.npmjs.com/package/react-router-dom) (MIT License)
17. [universal-cookie](https://www.npmjs.com/package/universal-cookie) (MIT License)
18. [validator](https://www.npmjs.com/package/validator) (MIT License)
19. [vite](https://www.npmjs.com/package/vite) (MIT License)
20. [web-vitals](https://www.npmjs.com/package/web-vitals) (Apache-2.0 License)



### Back-end Dependencies
1. [cef](https://pypi.org/project/cef/) (Mozilla Public License 2.0)
2. [Flask](https://flask.palletsprojects.com/) (BSD-3 License)
3. [Flask-Bcrypt](https://flask-bcrypt.readthedocs.io/en/latest/) (MIT License)
4. [Flask-Cors](https://flask-cors.readthedocs.io/en/latest/) (MIT License)
5. [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/en/stable/) (MIT License)
6. [Flask-Limiter](https://flask-limiter.readthedocs.io/en/stable/) (MIT License)
7. [Flask-Mail](https://pythonhosted.org/Flask-Mail/) (BSD License)
8. [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) (MIT License)
9. [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/en/3.x/) (MIT License)
10. [Gunicorn](https://gunicorn.org/) (MIT License)
11. [KVM](https://www.linux-kvm.org/) (GPLv2, extended by the Linux kernel)
12. [QEMU](https://www.qemu.org/) (GPLv2)
13. [SQLAlchemy](https://www.sqlalchemy.org/) (MIT License)
14. [websockify](https://github.com/novnc/websockify) (LGPLv3)