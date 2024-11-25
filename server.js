const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permetti connessioni da qualsiasi dominio (puoi limitare questo valore a specifici domini)
        methods: ["GET", "POST"]
    }
});

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
    console.log('Un giocatore si è connesso:', socket.id);

    socket.on('createRoom', (roomCode) => {
        rooms[roomCode] = { host: socket.id, players: [], numeriEstratti: [] };
        socket.join(roomCode);
        io.to(socket.id).emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode]) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            io.to(socket.id).emit('roomJoined', roomCode);
        } else {
            io.to(socket.id).emit('error', 'Stanza non trovata');
        }
    });

    socket.on('estraiNumero', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].host === socket.id) {
            let numeroEstratto;
            do {
                numeroEstratto = Math.floor(Math.random() * 90) + 1;
            } while (rooms[roomCode].numeriEstratti.includes(numeroEstratto));

            rooms[roomCode].numeriEstratti.push(numeroEstratto);
            io.to(roomCode).emit('numeroEstratto', numeroEstratto);
        }
    });

    socket.on('disconnect', () => {
        console.log('Giocatore disconnesso:', socket.id);
        // Rimuovi il giocatore dalla stanza
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            room.players = room.players.filter(player => player !== socket.id);
            if (room.host === socket.id) {
                delete rooms[roomCode];
                io.to(roomCode).emit('error', 'L\'host ha lasciato la stanza');
            }
        }
    });
});

const PORT = process.env.PORT || 3000; // Usa la porta fornita dal servizio di hosting o la porta 3000
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server avviato su http://0.0.0.0:${PORT}`);
});

 
