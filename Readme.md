# TaleForge

Welcome to TaleForge! An AI short story generator based on emotions. Create a flow of different emotions, then produce a story with OpenAI!

Thank you for this opportunity. I had many ideas that I wanted to implement, however I tried to keep to the time scale set to give a more reasonable reprentation of what can be achieved.

Things I missed:
- Comments - Apologises, I kept some comments through out but I ran out of time for commenting my code accurately. I will provide a follow up with comments ONLY later this weekend, the git commit will show no code changes, just extra comments.
- Add a basic authentication flow - My solution is not using particually secure technologies. I would want to implement a simple JWT model for my API requests, with some sanitisation/validation of the data coming in.
(mock user login via email/password, no need for real auth provider)
- Design - I know functionality is much more important than design on this, however a lick of paint wouldn't go amiss! With the retro styled emoticons, I was planning on a MSN Messenger themed AI story generator using the flow as messenger bubbles.
- Explore React Flow more - it's my first time using this library and I was blown away with it's simplicity. I would have been be reading more documentation and implementing more features.

## Setup

This solution is using React and NodeJS with an Express/Sqlite3 backend.

1. Install `npm install` from root of file (this will install both workspaces for front and back end)
2. Rename `.env.example` to `.env` to provide server side configuration variables
3. Run server with `cd backend && node server.js`
4. Run frontend with `cd frontend && npm run start`.
5. Navigate to `http://localhost:3000`


## Usage

1. Register a user on the root page.
2. Once registered login with user
3. Add a emotion by clicking the `plus` button and clicking on a emoticon.
4. Link the emoticons one by one
5. Remove an emoticon by selecting and removing with the `remove` button.
6. Click the floppy to `publish` changes (save to db)
7. Click the `share` button to create a url that can be shared with other users (when they log in they'll see the shared configuration)
8. Click `run` to start generating a story. If an open AI key is set up, a response from open AI will be produced.