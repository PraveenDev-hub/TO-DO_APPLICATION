const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Public', 'New folder', 'index.html')));

let db;

// Initialize Database and Server
async function startServer() {
    db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL
        )
    `);

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

// API Routes
app.get('/api/todos', async (req, res) => {
    const todos = await db.all('SELECT * FROM todos');
    res.json(todos);
});

app.post('/api/todos', async (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task is required' });
    const result = await db.run('INSERT INTO todos (task) VALUES (?)', task);
    res.json({ id: result.lastID, task });
});

app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    await db.run('DELETE FROM todos WHERE id = ?', id);
    res.json({ success: true });
});

startServer();