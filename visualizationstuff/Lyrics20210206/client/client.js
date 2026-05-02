var g_room_id;
var g_rank; // 房间中的 rank
var g_last_my_theta;
var g_is_host = false;
var g_curr_turn = 0;
var g_num_players = 0;
const GAME_STATUS_LOBBY = "lobby";
const GAME_STATUS_INGAME = "ingame";
const GAME_STATUS_GAMEOVER = "gameover";
var g_is_observer = false;
var g_game_status = GAME_STATUS_LOBBY;

let g_theta_min = 0, g_theta_max = 3.14159;
let g_score = {
  score: 0,
  combine_occ: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

let g_auto_drop = false;

let g_countdown_ms = 0;
let g_countdown_ms_prev = -999;

var SERVER_ADDR = "http://localhost:3000";
//var SERVER_ADDR = "http://127.0.0.1:3001";
//var SERVER_ADDR = "http://192.168.8.230:3001";
var g_is_single_player_mode = (new URLSearchParams(window.location.search).get("solo") === "1");

function EnableSinglePlayerMode() {
  g_room_id = "solo";
  g_rank = 0;
  g_curr_turn = 0;
  g_num_players = 1;
  g_is_host = true;
  g_is_observer = false;
  g_last_my_theta = undefined;
  g_state.cxn_state = "单机模式";
  g_state.cxn_role = "";
  g_state.room_info = "房间 solo（单机）";
  g_thetas = [3.1415 / 2];
  g_theta_targets = [3.1415 / 2];
  HideRoomButtons();
  InitializeGame();
  StartGame();
  GenCandidate();
  OnTurnChanged();
  StartCountdown(10);
}

function ConnectToServer() {
  if (g_is_single_player_mode) {
    EnableSinglePlayerMode();
    return;
  }
  g_room_id = undefined;
  g_is_host = false;
  
  console.log("[ConnectToServer]");
  socket = io(SERVER_ADDR);
  
  socket.on('hello_echo', (token)=>{
    g_token = token;
    OnConnected();
  });
  
  socket.on("roomstate", (room_states)=>{
    SpawnRoomButtons(room_states);
  });
  
  socket.on("create_new_game_failed", ()=>{
    console.log("房间已经有一场游戏了不能新建游戏");
  });
  
  socket.on("joined_game", (room_id)=>{
    g_state.cxn_state = "";
    g_state.room_info = "房间 " + room_id + "（玩家）";
    g_room_id = room_id;
    HideRoomButtons();
    StartGame();
  });
  
  socket.on("joined_game_observer", (room_id)=>{
    g_state.cxn_state = "";
    g_state.room_info = "房间 " + room_id + "（观察者）";
    g_room_id = room_id;
    HideRoomButtons();
    StartGame();
  });
  
  socket.on("join_game_failed", ()=>{
    console.log("加入房间失败");
  });
  
  socket.on("join_game_failed_room_full", ()=> {
    ShowBanner("该房间已经满了", 1000);
  });
  
  socket.on("poscene_snapshot", (snapshot, scores)=>{
    Load(snapshot);
    g_score = JSON.parse(scores);
  });
  
  socket.on("become_room_host", (room_id)=>{
      console.log("<< become_room_host");
    g_is_host = true;
    g_state.room_info = "房间 " + room_id + "（房主）";
    g_room_id = room_id;
    GenCandidate();
    SendCandidate();
    OnTurnChanged();
  });
  
  socket.on("initialize_game", ()=>{
    InitializeGame();
  });
  
  socket.on("rank", (rank)=>{
    g_rank = rank;
    console.log("<< rank " + rank);
  });
  
  socket.on("thetas", (thetas) => {
    console.log("thetas ");
    console.log(thetas);
    while (g_thetas.length < thetas.length) g_thetas.push(3.1415/2);
    while (g_thetas.length > thetas.length) g_thetas.pop();
    g_thetas = thetas.slice();
    g_theta_targets = thetas.slice();
    console.log(g_thetas)
    console.log(g_theta_targets)
  });
  
  socket.on("theta_one", (theta, rank) => {
    if (rank < g_thetas.length && rank != this.rank) {
      g_theta_targets[rank] = theta;
      while (g_thetas.length > g_theta_targets.length) g_thetas.pop();
    }
  });
  
  socket.on("cand", (cand) => {
    console.log(cand);
    if (cand == null) return;
    
    const j = JSON.parse(cand);
    
    if (j.type == "rect") {
      g_cand = new PoRect();
      Object.assign(g_cand, j);
      console.log(g_cand);
    } else if (j.type == "circle") {
      g_cand = new PoCircle();
      Object.assign(g_cand, j);
      console.log(g_cand);
    }
    g_cand.StartFadeIn();
  });
  
  socket.on("release_candidate", () => {
    if (g_is_host) {
      g_scene.shapes.push(g_cand);
      g_cand = undefined;
    }
  });
  
  socket.on("request_candidate", () => {
    if (g_is_host) {
      GenCandidate();
      SendCandidate();
      StopCountdown();
    }
  });
  
  socket.on("curr_turn", (turn, num_players) => {
    g_curr_turn = turn;
    if (g_rank == turn && g_game_status == GAME_STATUS_INGAME) {
      StartCountdown(10);
      OnTurnChanged();
    }
    g_num_players = num_players;
  });
  
  socket.on("gameover", ()=>{
    StopCountdown();
    g_state.turn_info = "游戏结束啦";
    do_GameOver();
  });
}

function CreateNewGame(rid) {
  if (g_is_single_player_mode) return;
  console.log(">> [CreateNewGame] " + rid);
  socket.emit("create_new_game", rid);
}

function JoinRoom(rid) {
  if (g_is_single_player_mode) return;
  console.log(">> [JoinRoom] " + rid);
  socket.emit("join_room", rid);
}

function JoinRoomAsObserver(rid) {
  if (g_is_single_player_mode) return;
  console.log(">> [JoinRoom] " + rid);
  socket.emit("join_room_observer", rid);
}

function SendSnapshotToRoom() {
  if (g_is_single_player_mode) return;
  if (g_room_id != undefined && g_is_host == true) {
    const snapshot = JSON.stringify(g_scene);
    const scores   = JSON.stringify(g_score);
    socket.emit("poscene_snapshot", snapshot, scores);
  }
}

function SendMyThetaIfNeeded(value, g_rank) {
  if (g_last_my_theta != value && !g_is_observer) {
    if (!g_is_single_player_mode && socket != undefined) {
      socket.emit("theta_one", value, g_rank);
    }
    g_last_my_theta = value;
  }
}

function RequestReleaseCandidate() {
  if (g_is_single_player_mode) {
    if (g_is_host && g_cand != undefined) {
      g_scene.shapes.push(g_cand);
      g_cand = undefined;
      GenCandidate();
      OnTurnChanged();
      if (g_game_status == GAME_STATUS_INGAME) {
        StartCountdown(10);
      }
    }
  } else if (socket != undefined) {
    socket.emit("request_release_candidate");
  }
  StopCountdown();
}

function SendCandidate() {
  if (g_is_single_player_mode || socket == undefined) return;
  const s = JSON.stringify(g_cand);
  //console.log(">> SendCandidate " + s);
  socket.emit("cand", s);
}

function StartCountdown(secs) {
  g_countdown_ms = secs * 1000;
}

function StopCountdown() {
  g_countdown_ms      = 0;
  g_countdown_ms_prev = 0;
}
