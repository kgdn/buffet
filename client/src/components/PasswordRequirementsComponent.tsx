/*
 * PasswordRequirementsComponent.tsx - Display password requirements for a password input.
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

interface PasswordRequirementsProps {
    password: string;
}

const PasswordRequirementsComponent: React.FC<PasswordRequirementsProps> = ({ password }) => {
    const requirements = [
        { regex: /.{8,}/, label: 'At least 8 characters' },
        { regex: /[A-Z]/, label: 'At least 1 uppercase letter' },
        { regex: /[a-z]/, label: 'At least 1 lowercase letter' },
        { regex: /[0-9].*[0-9]/, label: 'At least 2 digits' },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, label: 'At least 1 symbol' },
        { regex: /^\S*$/, label: 'No spaces' },
    ];

    return (
        <ul>
            {requirements.map((requirement, index) => (
                <li
                    key={index}
                    style={{
                        color: requirement.regex.test(password) ? 'green' : 'red',
                    }}
                >
                    {requirement.label}
                </li>
            ))}
        </ul>
    );
};

export default PasswordRequirementsComponent;