# Replace the placeholders with your actual values
API_BASE_URL="http://127.0.0.1:5000"
ACCESS_TOKEN_COOKIE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcwNDc1NDc0NCwianRpIjoiODcyZDI3NGEtNDI5Zi00NjViLTk1ZWQtY2Y0NWE4MmRhOTI3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImE2ZDNiNmNkMmFiMjQ4NDk5OGMxZjRjODA2Yjc5NDRmIiwibmJmIjoxNzA0NzU0NzQ0LCJleHAiOjE3MDQ4NDExNDR9.roCany0GPI0IxLznSy6VGAb83nM3vnBFWi9lZUCLboA"
USER_ID="a6d3b6cd2ab2484998c1f4c806b7944f"

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