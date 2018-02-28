#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'approval';

    ch.assertQueue(q, { durable: false });
    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    ch.consume(q, function reply(msg) {
      console.log(msg);
      var floorplanId = msg.content.toString();

      console.log(` [.] floorplanId: ${floorplanId}`);

      var reply = {
        error: null,
        data: {
          msg: 'Approved',
          id: floorplanId
        }
      };

      setTimeout(() => {
        ch.sendToQueue(
          msg.properties.replyTo,
          new Buffer(JSON.stringify(reply)),
          {
            correlationId: msg.properties.correlationId
          }
        );

        ch.ack(msg);
      }, 10000);
    });
  });
});
