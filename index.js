var udp = require('dgram');
var server = udp.createSocket('udp4');

const serverPort = 31120;
const SERVER_BYTES = [0x31, 0x3f];

server.on('error', error => {
  console.log('Error: ' + error);
  server.close();
});

const MESSAGE_TYPES = {
  INIT: 0x20,
  AFTER_INIT: 0x08,
  MYSTERY: 0x31,
};

const getResponse = message => {
  const messageType = message[2];
  switch (messageType){
    case MESSAGE_TYPES.INIT:
    case MESSAGE_TYPES.AFTER_INIT:
      return Buffer.from([...SERVER_BYTES, ...message.slice(2)]);
    case MESSAGE_TYPES.MYSTERY:
      console.log('????? received');
      // ****31$$########0100########CS
      server.close();
      return;
  }

  throw new Error('Unhandled message');
};


/**
 * @param {Buffer} msg
 */
server.on('message', (msg, info) => {
  console.log('RECV <<< %s (%d bytes)', msg.toString('hex'), msg.length);

  const response = getResponse(msg);

  if (response)
    server.send(response, info.port, 'localhost', function(error) {
      if (error){
        client.close();
      }
      else {
        console.log('SEND >>> %s (%d bytes)', response.toString('hex'), response.length);
      }
    });
});

server.on('listening', () => {
  var { port, family, address } = server.address();
  console.log(`LSTN ${address}:${port} (${family})`);
});

server.on('close', () => {
  console.log('CLSD');
  process.exit();
});

server.bind(serverPort);
