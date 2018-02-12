var crypto = require('crypto')
var Swarm = require('discovery-swarm')
var defaults = require('dat-swarm-defaults')
var getPort = require('get-port')

// Peer Identity
var myId = crypto.randomBytes(32)
console.log('My Identity: ' + myId.toString('hex'))

// Default DNS and DHT servers
var config = defaults({
  id: myId, // peer-id for user
})

// Used for peer discovery
var sw = Swarm(config)

var peers = {}

;(async () => {

  // Random unused port
  let port = await getPort()
  console.log('Port: ' + port)

  sw.listen(port)
  // A test channel for connecting to
  sw.join('our-fun-channel')

  sw.on('connection', (conn, info) => {
    let peerId = info.id.toString('hex')
    // Disallow multiple connecions with same peer
    if (peers[peerId]) {
      conn.destroy()
      return
    }
    console.log('Connected to peer: ', peerId)
    try {
      conn.setKeepAlive(true, 600)
    } catch (exception) {
      console.log('exception', exception)
    }

    conn.write('Hello from ' + myId.toString('hex'))

    conn.on('data', data => {
      console.log('Received Message: ', data.toString())
    })

    conn.on('close', () => {
      delete peers[peerId]
      console.log('Connection closed')
    })

  })
})()
