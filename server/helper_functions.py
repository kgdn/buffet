# helper_functions.py - Contains helper functions for the server.
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
from datetime import datetime


class HelperFunctions:
    """Contains helper functions for the server."""

    @staticmethod
    def create_cef_logs_folders():
        """Creates the logs/ directory if it doesn't exist and creates a new directory for the current date."""
        date_str = str(datetime.now().date())
        if not os.path.exists("logs/" + date_str + "/"):
            os.makedirs("logs/" + date_str + "/")
        if not os.path.exists("logs/" + date_str + "/buffet.log"):
            with open("logs/" + date_str + "/buffet.log", "w", encoding="utf-8") as f:
                f.write("")
