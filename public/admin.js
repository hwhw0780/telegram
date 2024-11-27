document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    
    // Search functionality
    document.getElementById('searchUser').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterUsers(searchTerm);
    });
});

async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();
        
        updateStats(users);
        displayUsers(users);
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

function updateStats(users) {
    document.getElementById('totalUsers').textContent = users.length;
    const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
    document.getElementById('totalPoints').textContent = totalPoints;
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.points}</td>
            <td>${user.gameHistory.length} games</td>
            <td>${user.transactions.length} transactions</td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser('${user.username}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.username}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterUsers(searchTerm) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    rows.forEach(row => {
        const username = row.cells[0].textContent.toLowerCase();
        row.style.display = username.includes(searchTerm) ? '' : 'none';
    });
}

async function editUser(username) {
    // Implement edit functionality
}

async function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user ${username}?`)) {
        try {
            const response = await fetch(`/api/admin/users/${username}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadUsers();
            }
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    }
} 