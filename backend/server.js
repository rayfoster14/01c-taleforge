const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// Register account
app.post('/api/register', async function (req, res) {
  const {
    name,
    password
  } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      error: 'Missing name or password'
    });
  }

  //Simple hasing algorithm as not to store pws in plain text.
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (name, password) VALUES (?, ?)',
    [name, hashedPassword],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: 'User already exists or error occurred'
        });
      }
      res.status(200).json({
        success: true
      });
    }
  );
});


//Login request
app.post('/api/login', function (req, res) {
  const {
    name,
    password
  } = req.body;

  //Get the user from the database
  db.get('SELECT * FROM users WHERE name = ?', [name], async function (err, row) {
    if (err || !row) {
      return res.status(401).json({
        error: 'Invalid name or password'
      });
    }

    //Compare hashes of passwords
    const passwordMatch = await bcrypt.compare(password, row.password);
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid name or password'
      });
    }

    //Successful response
    res.status(200).json({
      success: true,
      userId: row.id
    });
  });
});

//Save a request
app.post('/api/publish', function (req, res) {
  console.log('Publishing...')
  const userId = req.body.userId;
  const flowData = req.body.flowData;

  //Validate flow data exists
  if (!userId || !flowData) {
    return res.status(400).json({
      error: 'Missing user ID or flow data'
    });
  }

  //Update the flow data object
  db.run(
    'UPDATE users SET flow_data = ? WHERE id = ?',
    [JSON.stringify(flowData), userId],
    function (err) {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }
      res.json({
        message: 'Flow published successfully'
      });
    }
  );
});

//Create an AI story from nodes
app.post('/api/generateStory', function (req, res) {
  console.log('Getting AI Response');
  const emotionList = req.body.emotionList;

  //Validate emotion list
  if (!emotionList) {
    return res.status(400).json({
      error: 'Missing emotion list'
    });
  }

  //This is an API key
  const apiKey = process.env.OPEN_AI_APIKEY;

  if (!apiKey) {
    //No api key found, return this sample story
    let story = `Sample Response - use your imagination and write a story about the emotions${emotionList.join(', ')}... however, add your openAI key to get a contextual response!`
    res.json({
      story
    });
  } else {
    //Fetch a story from open AI
    try {
      fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: "You are a fun story teller, who specalises in simple, light-hearted stories"
              },
              {
                role: "user",
                content: `Generate a short story as a paragraph, use these emotions in order: ${emotionList.join(', ')}`
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        })
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          const reply = data.choices[0]?.message ?.content;
          res.json({
            story: reply
          });
        });
    } catch (error) {
      res.json({
        story
      });
    }
  }
});

//Get the published version of the flow data from the database
app.get('/api/user-flow/:userId', function (req, res) {
  const userId = req.params.userId;

  db.get('SELECT flow_data FROM users WHERE id = ?', [userId], function (err, row) {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    if (!row || !row.flow_data) {
      return res.json({
        nodes: [],
        edges: []
      }); // No saved flow
    }

    let parsed;
    try {
      parsed = JSON.parse(row.flow_data);
    } catch (e) {
      return res.status(500).json({
        error: 'Invalid flow data format'
      });
    }

    res.json(parsed);
  });
});


//Set up port for exposing the database
const PORT = 5000;
app.listen(PORT, function () {
  console.log('Backend listening on http://localhost:' + PORT);
});