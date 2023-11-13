document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 400;
  var isGameOver = false;
  var gameTime = 60; // 制限時間を60秒に設定
  var lastTime = Date.now();
  var score = 0; // スコアを追跡する変数

  var player = {
    x: 100,
    y: canvas.height - 150,
    width: 50,
    height: 50,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
  };

  var keys = [];
  var gravity = 0.2;
  var friction = 0.9;

  var enemy = {
    x: 300, // 敵の初期位置X
    y: canvas.height - 150, // 敵の初期位置Y
    width: 50, // 敵の幅
    height: 50, // 敵の高さ
    alive: true, // 敵が生きているかどうか
  };

  var enemies = []; // 敵を格納する配列
  createEnemy(); // 初期敵を生成

  function createEnemy() {
    var newEnemy = {
      x: canvas.width - 50, // 画面の右端から出現
      y: canvas.height - 150,
      width: 50,
      height: 50,
      dx: -2, // 左に移動する初期設定
      alive: true,
    };
    enemies.push(newEnemy);
  }

  function checkCollision() {
    enemies.forEach(function (enemy, index) {
      if (!enemy.alive) return; // 既に倒された敵はスキップ

      if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y &&
        player.y + player.height > enemy.y
      ) {
        enemy.alive = false;
        score += 100; // スコアを一度だけ加算
        createEnemy(); // 新しい敵を生成
      }
    });
  }

  function drawEnemy() {
    if (enemy.alive) {
      ctx.fillStyle = "blue"; // 敵の色を設定
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height); // 敵を描画
    }
  }

  function moveEnemies() {
    enemies.forEach(function (enemy) {
      if (enemy.alive) {
        enemy.x += enemy.dx;
        if (enemy.x > canvas.width - enemy.width || enemy.x < 0) {
          enemy.dx *= -1; // 移動方向を反転
        }
      }
    });
  }

  function drawEnemies() {
    enemies.forEach(function (enemy) {
      if (enemy.alive) {
        ctx.fillStyle = "blue";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }
    });
  }

  // キーボードのイベントリスナー
  document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
  });

  document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
  });

  function update() {
    if (isGameOver) return;
    var now = Date.now();
    var deltaTime = (now - lastTime) / 1000; // 経過時間を秒単位で計算
    lastTime = now;

    // タイマーを減少させる
    gameTime -= deltaTime;
    if (gameTime <= 0) {
      // タイマーが0になったらゲーム終了
      gameOver();
      return; // これ以降の描画や更新を停止
    }

    // プレイヤーの移動
    if (keys[37] || keys[65]) {
      // 左矢印かAキー
      if (player.velX > -player.speed) {
        player.velX--;
      }
    }

    if (keys[39] || keys[68]) {
      // 右矢印かDキー
      if (player.velX < player.speed) {
        player.velX++;
      }
    }

    if (keys[38] || keys[87]) {
      // 上矢印かWキー
      if (!player.jumping) {
        player.jumping = true;
        player.velY = -player.speed * 2;
      }
    }

    player.velX *= friction;
    player.velY += gravity;

    player.x += player.velX;
    player.y += player.velY;

    if (player.x >= canvas.width - player.width) {
      player.x = canvas.width - player.width;
    } else if (player.x <= 0) {
      player.x = 0;
    }

    if (player.y >= canvas.height - player.height) {
      player.y = canvas.height - player.height;
      player.jumping = false;
    }

    if (enemy.alive) {
      checkCollision();
    }

    score += 1; // ここでは単純にフレームごとにスコアを1点ずつ増やしています

    // 描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    moveEnemies();
    drawEnemies();
    checkCollision();

    enemies = enemies.filter(function (enemy) {
      return enemy.alive;
    });
    // タイマーを画面に表示
    displayTime();
    displayScore(); // スコアを表示する関数の呼び出し
    requestAnimationFrame(update);
  }

  function displayTime() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Time: " + gameTime.toFixed(2), 10, 30); // 残り時間を表示
  }

  function gameOver() {
    isGameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";

    // ゲームオーバーテキストの表示
    ctx.fillText("Game Over!", canvas.width / 2 - 100, canvas.height / 2 - 50);

    // スコアの表示
    ctx.fillText("Score: " + score, canvas.width / 2 - 100, canvas.height / 2);

    drawRestartButton(); // リスタートボタンの描画
  }

  function displayScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, canvas.width - 120, 30); // スコアの表示
  }

  function drawRestartButton() {
    ctx.fillStyle = "#000";
    ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 + 30, 100, 40);
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("Restart", canvas.width / 2 - 40, canvas.height / 2 + 60);
  }

  function restartGame() {
    if (!isGameOver) return; // ゲームオーバーでなければリスタートしない

    isGameOver = false;
    gameTime = 5; // 制限時間をリセット
    lastTime = Date.now(); // タイマーをリセット

    score = 0;
    player = {
        x: 100,
        y: canvas.height - 150,
        width: 50,
        height: 50,
        speed: 5,
        velX: 0,
        velY: 0,
        jumping: false
    };
    enemies = []; // 敵をリセット
    createEnemy(); // 初期敵を生成

    // ゲームループを再開
    requestAnimationFrame(update);
}


  function onCanvasClick(e) {
    var rect = canvas.getBoundingClientRect();
    var clickX = e.clientX - rect.left;
    var clickY = e.clientY - rect.top;

    // リスタートボタンの位置
    var buttonX = canvas.width / 2 - 50;
    var buttonY = canvas.height / 2 + 30;
    var buttonWidth = 100;
    var buttonHeight = 40;

    // ボタンがクリックされたか判定
    if (
      clickX > buttonX &&
      clickX < buttonX + buttonWidth &&
      clickY > buttonY &&
      clickY < buttonY + buttonHeight
    ) {
      restartGame();
    }
  }

  canvas.addEventListener("click", onCanvasClick);

  // ゲームの開始
  update();
});
