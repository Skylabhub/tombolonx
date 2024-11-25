const express = require('express');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000; // Usa la porta fornita da Render o 3000 in locale

// Middleware per il logging delle richieste
app.use((req, res, next) => {
    console.log(`Richiesta ricevuta: ${req.method} ${req.url}`);
    next();
});

// Route di test
app.get('/', (req, res) => {
    res.send('Server funzionante! Puoi connetterti.');
});

// Socket.IO per gestire le connessioni in tempo reale
io.on('connection', (socket) => {
    console.log('Un client si è connesso:', socket.id);

    socket.on('createRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`Stanza creata: ${roomCode}`);
        socket.emit('roomCreated', `Hai creato la stanza ${roomCode}`);
    });

    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`Utente unito alla stanza: ${roomCode}`);
        io.to(roomCode).emit('userJoined', `Un utente si è unito alla stanza ${roomCode}`);
    });

    socket.on('estraiNumero', (roomCode) => {
        const numeroEstratto = Math.floor(Math.random() * 90) + 1;
        console.log(`Numero estratto per la stanza ${roomCode}: ${numeroEstratto}`);
        io.to(roomCode).emit('numeroEstratto', numeroEstratto);
    });

    socket.on('disconnect', () => {
        console.log('Un client si è disconnesso:', socket.id);
    });
});

// Avvio del server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server avviato e in ascolto su http://0.0.0.0:${PORT}`);
});

