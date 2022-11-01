const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//get players API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ;`;
  const playersArray = await db.all(getPlayersQuery);
  let list = [];
  for (let player of playersArray) {
    let ob = {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
    list.push(ob);
  }
  response.send(list);
});
//Post API

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = ` INSERT INTO
     cricket_team(player_name,jersey_number,role)
    VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const player = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});
//get single player API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayersQuery = `SELECT * FROM cricket_team where player_id=${playerId};`;
  const player = await db.get(getPlayersQuery);
  const resOb = {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };
  response.send(resOb);
});

//update player API
app.put("/players/:playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `UPDATE cricket_team
     SET 
     player_name='${playerName}',
     jersey_number=${jerseyNumber},
     role='${role}'

     WHERE player_id=${playerId};
     `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});
//delete player API
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE  FROM cricket_team 
    WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
