import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('https://jwt-login-mu.vercel.app/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Failed to fetch users');
          return;
        }

        // Support either array response or object-wrapped list from backend.
        const list = Array.isArray(data) ? data : data.users || [];
        setUsers(list);
      } catch (err) {
        setError('Server error while loading users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>All Users</h1>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      {!loading && !error && users.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '3px solid black', padding: '8px' }}>#</th>
              <th style={{ border: '3px solid black', padding: '8px' }}>Name</th>
              <th style={{ border: '3px solid black', padding: '8px' }}>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id || idx}>
                <td style={{ border: '3px solid black', padding: '8px' }}>{idx + 1}</td>
                <td style={{ border: '3px solid black', padding: '8px' }}>{user.name}</td>
                <td style={{ border: '3px solid black', padding: '8px' }}>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}


      <button onClick={logout}>Logout</button>
    </div>
  );
}
