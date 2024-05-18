# gunicorn.conf.py - Allows Gunicorn to use the .env file for environment variables.
# Copyright (C) 2024, Kieran Gordon
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
import os

from dotenv import load_dotenv

load_dotenv()


bind = os.getenv(
    "GUNICORN_BIND_ADDRESS"
)  # Set the bind address. This can be overridden using --bind.
certfile = os.getenv(
    "SSL_CERTIFICATE_PATH"
)  # Set the certificate file. This is required for HTTPS.
keyfile = os.getenv("SSL_KEY_PATH")  # Set the key file. This is required for HTTPS.
workers = (
    os.cpu_count() * 2 + 1
)  # Auto-calculate the number of workers. This can be overridden using --workers. This is set to 2 * the number of CPU cores + 1 for optimal performance.
threads = (
    os.cpu_count() * 2 + 1
)  # Auto-calculate the number of threads. This can be overridden using --threads. This is set to 2 * the number of CPU cores + 1 for optimal performance.
worker_class = os.getenv(
    "GUNICORN_WORKER_CLASS"
)  # Set the worker class. This can be overridden using --worker-class.
