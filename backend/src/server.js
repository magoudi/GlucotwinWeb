const app = require('./app');
const compression = require('compression');
const connectDB = require('./config/db');
const { clientOrigins, port } = require('./config/env');
const http = require('http');
const { Server } = require('socket.io');
const { verifyToken } = require('./utils/auth');
const userStore = require('./services/userStore');

app.use(compression());

function parseCookies(header = '') {
  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex);
      const value = decodeURIComponent(part.slice(separatorIndex + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function resolveSocketToken(socket) {
  const cookies = parseCookies(socket.handshake.headers.cookie || '');

  if (cookies.impersonation_token || cookies.token) {
    return cookies.impersonation_token || cookies.token;
  }

  const authToken = socket.handshake.auth && socket.handshake.auth.token;

  return typeof authToken === 'string' ? authToken : null;
}

async function startServer() {
  try {
    await connectDB();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: clientOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
      }
    });

    app.set('io', io);

    io.use(async (socket, next) => {
      try {
        const token = resolveSocketToken(socket);

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const payload = verifyToken(token);
        const user = await userStore.findById(payload.sub);

        if (!user) {
          return next(new Error('Authenticated user no longer exists'));
        }

        socket.data.auth = payload;
        socket.data.user = {
          id: user._id.toString(),
          role: user.role,
        };
        next();
      } catch (error) {
        next(new Error('Invalid or expired authentication token'));
      }
    });

    io.on('connection', (socket) => {
      const userId = socket.data.user && socket.data.user.id;
      const userRole = socket.data.user && socket.data.user.role;

      if (userId) {
        // All users join their patient room (for treatment plan notifications, etc.)
        socket.join(`patient_${userId}`);

        // Doctors join their own doctor room for patient responses
        if (userRole === 'doctor') {
          socket.join(`doctor_${userId}`);
        }

        // Admins join the admin broadcast room
        if (userRole === 'admin') {
          socket.join('admin_room');
        }
      }

      socket.on('join_patient_room', (patientId) => {
        if (!socket.data.user || patientId !== socket.data.user.id) {
          return;
        }

        socket.join(`patient_${patientId}`);
      });
    });

    server.listen(port, () => {
      console.log(`GlucoTwin API listening on port ${port}`);
      
      // Start background jobs
      const { startNightlyScan } = require('./jobs/nightlyScan');
      startNightlyScan();
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Could not start GlucoTwin API: port ${port} is already in use`);
        process.exit(1);
      }

      throw error;
    });
  } catch (error) {
    console.error(`Could not start GlucoTwin API: ${error.message}`);
    process.exit(1);
  }
}

startServer();
