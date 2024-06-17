<div align="center" style="margin-bottom: 20px;">
  <img src="assets/logo.png" alt="Buffet Logo" width="200" height="200">
</div>

<div align="center">
  <h1>Buffet</h1>
  <p>A full-stack, fully-featured web-based virtual machine manager</p>

[![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0) [![GitHub issues](https://img.shields.io/github/issues/kgdn/buffet)](https://github.com/kgdn/buffet/issues) [![GitHub stars](https://img.shields.io/github/stars/kgdn/buffet)](https://github.com/kgdn/buffet/stargazers)

</div>

Buffet is a full-stack, fully-featured web-based virtual machine manager that aims to provide a free, open-source, easy-to-use, secure alternative to other web-based virtual machine managers such as [DistroSea](https://distrosea.com/) and [DistroTest](https://www.reddit.com/r/DistroHopping/comments/wqrwbw/what_happened_to_distrotestnet/).

The back-end is written in Python using the [Flask](https://flask.palletsprojects.com/en/3.0.x/) web framework, and the front-end is written in TypeScript with the [React](https://react.dev/) library. Buffet uses [QEMU](https://www.qemu.org/) and [KVM](https://www.linux-kvm.org/) for virtualization, and [noVNC](https://novnc.com/info.html) + [websockify](https://github.com/novnc/websockify) for remote desktop access.

Buffet in its original form was made over the course of 12 weeks as part of the final project for my bachelor's degree in Computer Systems at the [School of Mathematical and Computer Sciences](https://www.hw.ac.uk/schools/mathematical-computer-sciences.htm) at [Heriot-Watt University](https://www.hw.ac.uk/). Since then, I have continued to work on Buffet in my free time to improve it and add new features.

> [!IMPORTANT]
> **Please note that Buffet is not intended for production use, as it is still in the early stages of development.** 
>
> However, you are welcome to use it for testing and development purposes. Please report any bugs or issues you encounter on the [Issues](https://github.com/kgdn/buffet/issues) page. Feel free to contribute to the project by submitting a pull request.


## Features

- Access virtual machines securely using noVNC, websockify with SSL/TLS support, and randomly generated, one time VNC passwords
- Administer users, virtual machines and logs from the admin panel
- Create, start, and delete QEMU/KVM virtual machines
- Define custom operating systems and distributions using JSON
- Email-based account verification
- Fully responsive front-end that works on desktops, tablets, and smartphones
- Lightweight, easy-to-setup back-end using Flask and SQLAlchemy
- Runs on GNU/Linux servers with QEMU and KVM support
- Secure user authentication and authorisation using JSON Web Tokens (JWT), bcrypt and two-factor authentication
- Compatible with any relational database supported by SQLAlchemy, such as SQLite, PostgreSQL, MySQL, and MariaDB

## Screenshots and GIFs

<div align="center">
    <img src="assets/light-mode.png" alt="Light Mode">
    <p>Buffet comes with a light theme that is easy on the eyes and looks great on any device.</p>
</div>

<div align="center">
    <img src="assets/dark-mode.png" alt="Dark Mode">
    <p>If you prefer a darker theme, Buffet has you covered with a dark mode that is easy on the eyes.</p>
</div>

<div align="center">
    <img src="assets/virtual-machine-view.gif" alt="Virtual Machine View">
    <p>The virtual machine view allows you to access your virtual machines using noVNC, and comes with draggable, usable navigation bars.</p>
</div>

## Installation

Buffet is designed to be easy to install and use. It consists of two main components: the front-end and the back-end. The front-end is a React application that communicates with the back-end using a RESTful API. The back-end is a Flask application that provides the RESTful API for the front-end to communicate with.

If you want to host your own instance of Buffet, you will need to install both the front-end and the back-end on your server. A detailed guide on how to install Buffet is provided below. Instructions for installing the front-end, the back-end, and the Docker container are provided in the [Docker Compose Installation](#docker-compose-installation) section. Alternatively, if you just want to install them using the base Docker command, look for the Docker Container Installation in each section.

### Front-end Installation

The front-end is a React application that communicates with the back-end using the RESTful API. It is designed to be lightweight, easy to install, and easy to use.

> [!NOTE]
> You can install the front-end on any server that supports Node.js and npm, i.e. on Windows, macOS, or GNU/Linux.

#### Requirements

- Node.js v20.10.0 or later
- npm 10.4.0 or later

#### Standard Installation

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
BROWSER= # none or chrome or firefox or edge or safari
GENERATE_SOURCEMAP= # true or false
VITE_BASE_URL= # url of api (e.g. https://localhost)
VITE_MAX_VM_COUNT= # max no. of virtual machines available at any given time
```

5. Start the development server (optional):

```bash
npm run dev
```

6. Build the production version:

```bash
npm run build
```

7. Deploy the production version to your server using your preferred method, such as Nginx, Apache, or Caddy.

```bash
npm run build && cp -r dist/* /path/to/your/webserver/
```

#### Docker Container Installation

> [!NOTE]
> This assumes you have followed the steps in the [Front-end Installation](#front-end-installation) up until step 4.
> If you have not done so, please refer to the [Front-end Installation](#front-end-installation) section for more details.
>
> It is highly recommended to use the Docker Compose installation method as detailed in the [Docker Compose Installation](#docker-compose-installation) section instead.

1. Modify the `nginx/example.conf` file to match your desired configuration. Rename it to `nginx.conf` and save it.

```bash
mv example.conf nginx.conf
```

2. Build the Docker image:

```bash
docker build -t buffet-client .
```

3. Run the Docker container, where `./certs` is the path to the SSL certificates:

```bash
docker run -v ./certs:/app/certs/ -p 443:443 --name buffet-client -d buffet-client
```

### Back-end Installation

The back-end is a Flask application that provides the RESTful API for the front-end to communicate with, allowing for the creation of virtual machines and querying of database data.

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

Buffet uses SQLAlchemy to interact with the database. A database is required to store user information and virtual machine information. You can use any SQL database supported by SQLAlchemy, such as SQLite, PostgreSQL, MySQL, and MariaDB. You can use a Docker container for this if you prefer.

- To use SQLite, you can set the `SQLALCHEMY_DATABASE_URI` variable in the `.env` file to `sqlite:///db.sqlite3`. This requires no additional setup.

- To use PostgreSQL, you can set the `SQLALCHEMY_DATABASE_URI` variable in the `.env` file to `postgresql://username:password@localhost/dbname`. This assumes that you have a PostgreSQL database running on your server. You may need to install the `psycopg2` package using pip. **This is the recommended database for production use.**
- To use MySQL/MariaDB, you can set the `SQLALCHEMY_DATABASE_URI` variable in the `.env` file to `mysql://username:password@localhost/dbname`. This assumes that you have a MySQL database running on your server. You may need to install the `mysql-connector-python` package using pip.

#### Standard Installation

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
GUNICORN_LOG_LEVEL= # log level, i.e. debug
GUNICORN_ACCESS_LOG= # access log, i.e. gunicorn_access.log
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
  } // add more distributions here
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

#### Docker Container Installation

> [!NOTE]
> This assumes you have followed the steps in the [Back-end Installation](#back-end-installation) up until step 8.
> If you have not done so, please refer to the [Back-end Installation](#back-end-installation) section for more details.
>
> It is highly recommended to use the Docker Compose installation method as detailed in the [Docker Compose Installation](#docker-compose-installation) section instead.

1. Build the Docker image:

```bash
docker build -t buffet-server .
```

2. Run the Docker container, where `./iso` is the path to the virtual machine images and `./certs` is the path to the SSL certificates:

```bash
docker run -v ./iso:/app/iso -v ./certs:/app/certs -p 8000:8000 --name buffet-server -d buffet-server
```

### Docker Compose Installation

An example `docker-compose.yml` file is shown below, and is available in the root of the repository [here](https://github.com/kgdn/buffet/blob/master/docker-compose.yml). You should follow the same structure, but change `POSTGRES_PASSWORD`, `POSTGRES_USER`, and `POSTGRES_DB` to your desired values.

```yml
services:
  client:
    build: client/
    ports:
      - 443:443
    volumes:
      - ./certs:/app/certs
  server:
    build: server/
    devices:
      - "/dev/kvm:/dev/kvm"
    volumes:
      - ./iso:/app/iso
      - ./certs:/app/certs
    network_mode: host
  database:
    image: postgres
    environment:
      POSTGRES_PASSWORD: postgres # Change this to your desired password
      POSTGRES_USER: postgres # Change this to your desired username
      POSTGRES_DB: postgres # Change this to your desired database
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  iso:
  certs:
  db-data:
```

To build and run the Docker containers, you can use the following commands:

```bash
docker compose build
docker compose up
```

## Contributing

Buffet is an open-source project, and contributions are welcome. If you would like to contribute to Buffet, please follow the standard guidelines for contributing to open-source projects. That is, fork the repository, make your changes, and submit a pull request.

> [!IMPORTANT]
> When contributing to Buffet's back-end, please follow the [PEP 8](https://pep8.org/) style guide for Python code. Please ensure that your code follows the [PEP 8](https://pep8.org/) style guide and that your commit messages are clear and concise. Use the Black code formatter, isort, and pylint to format your code and check for errors.
> 
> When contributing to Buffet's front-end, use ESLint, Prettier and Stylelint to format your code and check for errors.

## License

Buffet is licensed under the GNU Affero General Public License v3.0. You are free to use, modify, and distribute Buffet under the terms of the AGPLv3. Please read the [LICENSE](LICENSE) file for more information.

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
7. [Flask-Mail](https://flask-mail.readthedocs.io/en/latest/) (BSD-3 License)
8. [Flask-Migrate](https://flask-migrate.readthedocs.io/en/latest/) (MIT License)
9. [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/en/3.x/) (MIT License)
10. [Gunicorn](https://gunicorn.org/) (MIT License)
11. [KVM](https://www.linux-kvm.org/) (GPLv2, extended by the Linux kernel)
12. [QEMU](https://www.qemu.org/) (GPLv2)
13. [SQLAlchemy](https://www.sqlalchemy.org/) (MIT License)
14. [websockify](https://github.com/novnc/websockify) (LGPLv3)
