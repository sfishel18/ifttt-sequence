const Firestore = require('@google-cloud/firestore');
const axios = require('axios');

const stringify = input =>
  typeof input === "string" ? input : JSON.stringify(input);

const db = new Firestore({
  projectId: 'ifttt-sequence',
  keyFilename: './keyfile.json',
});

const supportedCommands = [
    'advance',
    'next',
    'previous',
    'repeat',
    'retreat'
]

exports.index = (req, res) => {
  if (req.method === "HEAD") {
    res.status(200).send();
    return;
  }
  const { auth, command, id, webhooks } = req.body;
  if (auth !== process.env.AUTH_KEY) {
    res.status(401).send("Access denied");
    return;
  }
  if (!id) {
    res.status(400).send('Required argument "id" is missing or empty');
    return;
  }
  if (!supportedCommands.includes(command)) {
    res.status(400).send(`Command "${command}" is not supported`);
    return;
  }
  if (!webhooks || webhooks.length === 0) {
    res.status(400).send('Required argument "webhooks" is missing or empty');
    return;
  }
  db.doc(`sequences/${encodeURIComponent(id)}`).get()
    .then(snapshot => {
        let index = snapshot.exists ? snapshot.get('index') : -1;
        let newIndex = index;
        if (command === 'next' || command === 'advance') {
            newIndex = (index + 1) % webhooks.length;
        } else if (command === 'previous' || command === 'retreat') {
            newIndex = index <= 0 ? webhooks.length - 1 : index - 1
        }
        return Promise.all([
            command === 'advance' || command === 'retreat' ? 
              Promise.resolve() : 
              axios.get(webhooks[newIndex]).then(response => stringify(response.data)),
            newIndex === index ? 
                Promise.resolve() : 
                db.doc(`sequences/${encodeURIComponent(id)}`).set({
                    index: newIndex
                })
        ])
    })
    .then(([webhookMessage]) => res.status(200).send(webhookMessage))
    .catch(err => {
        console.error(err);
        res.status(400).send('Error triggering webhook')
    })
};
