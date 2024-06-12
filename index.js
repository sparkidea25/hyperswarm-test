const Hyperswarm = require('hyperswarm')

// Create two Hyperswarm instances
const swarm1 = new Hyperswarm()
const swarm2 = new Hyperswarm()

// Handle connections on swarm1 (acting as a server)
swarm1.on('connection', (conn, info) => {
  console.log('Server received connection')
  conn.write('this is a server connection')
  conn.end()
})

// Handle connections on swarm2 (acting as a client)
swarm2.on('connection', (conn, info) => {
  console.log('Client received connection')
  conn.on('data', data => console.log('Client got message:', data.toString()))
})

// Define a 32-byte topic buffer
const topic = Buffer.alloc(32).fill('hello world') // A topic must be 32 bytes

// Use an async function to handle the asynchronous operations
(async () => {
  try {
    // Announce the topic on swarm1 (acting as a server)
    const discovery1 = swarm1.join(topic, { server: true, client: false })
    await discovery1.flushed() // Wait for the topic to be fully announced on the DHT
    console.log('Server announced topic and is ready for connections')

    // Join the topic on swarm2 (acting as a client)
    const discovery2 = swarm2.join(topic, { server: false, client: true })
    await discovery2.flushed() // Wait for the client to be ready to connect to peers
    console.log('Client joined topic and is attempting to connect to peers')
  } catch (error) {
    console.error('An error occurred:', error)
  }
})()

// Handle termination signals to clean up resources
const cleanUp = () => {
  console.log('Cleaning up swarms')
  swarm1.destroy()
  swarm2.destroy()
  process.exit()
}

process.on('SIGINT', cleanUp)
process.on('SIGTERM', cleanUp)
