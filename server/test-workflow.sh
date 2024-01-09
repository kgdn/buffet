# Replace the placeholders with your actual values
API_BASE_URL="http://localhost:5000"
ACCESS_TOKEN_COOKIE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcwNDgxODQ5NSwianRpIjoiMGJkNmNhMjYtZWI4MC00MWFhLWE1MDAtYmM2ZDExYTQxZDljIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjRjZjQ3Y2RmZWM2YTRiMzFiYTA2YjZhZTg0M2VkYmQxIiwibmJmIjoxNzA0ODE4NDk1LCJleHAiOjE3MDQ4MjIwOTV9.ip3TDHaRBR1i-sEpSpB4BSxczI2ttHECRotljL-i4WM"
USER_ID="4cf47cdfec6a4b31ba06b6ae843edbd1"

# Get all VMs
echo ""
echo "Getting all VMs:"
curl -X GET "${API_BASE_URL}/api/vm/iso/" --cookie "access_token_cookie=${ACCESS_TOKEN_COOKIE}"

# Create a VM
echo ""
echo "Creating VM with ISO fedora.iso:"
curl -X POST "${API_BASE_URL}/api/vm/create/" -H "Content-Type: application/json" --data '{"iso": "fedora.iso"}' --cookie "access_token_cookie=${ACCESS_TOKEN_COOKIE}"

# Get the user's VMs
echo ""
echo "Getting VMs for user with ID ${USER_ID}:"
curl -X GET "${API_BASE_URL}/api/vm/user/?user_id=${USER_ID}" --cookie "access_token_cookie=${ACCESS_TOKEN_COOKIE}"

# Admin only GET request
echo ""
echo "[ADMIN] Getting all VMs:"
curl -X GET "${API_BASE_URL}/api/admin/vm/all/" --cookie "access_token_cookie=${ACCESS_TOKEN_COOKIE}"

# Shutdown the VM
echo ""
echo "Shutting down VM with ID 1:"
curl -X DELETE "${API_BASE_URL}/api/vm/delete/" -H "Content-Type: application/json" --data '{"vm_id": 1}' --cookie "access_token_cookie=${ACCESS_TOKEN_COOKIE}"