var TicTacToe = function(io) {

	var body = document.body;
	var message = document.getElementById("message");
	var resetButton = document.getElementById("reset");
	var metaWrap = document.getElementById("wrap");
	var meBtn = document.getElementById("me");
	var computerBtn = document.getElementById("computer");
	var canvas = io.canvas;

	var step = 0;

	var grid = null;

	var init = function() {
		canvas.width = canvas.height = Math.min(body.clientWidth, body.clientHeight) - 200;
		if (canvas.width < 400) canvas.width = canvas.height += 130;

		metaWrap.style.width = canvas.width + "px";

		step = 0;

		grid = io.addObj(new iio.Grid(0,0,3,3,canvas.width/3).setStrokeStyle("white"));
		grid.resetCells();

		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if (typeof grid.cells[x][y].taken == "undefined")
					grid.cells[x][y].taken = 0;
			}
		}
	};

	var check = function(x, y) {
		if (Math.abs(grid.cells[x][0].taken + grid.cells[x][1].taken + grid.cells[x][2].taken) == 3) {
			return true;
		}
		if (Math.abs(grid.cells[0][y].taken + grid.cells[1][y].taken + grid.cells[2][y].taken) == 3) {
			return true;
		}
		if (Math.abs(grid.cells[0][0].taken + grid.cells[1][1].taken + grid.cells[2][2].taken) == 3) {
			return true;
		}
		if (Math.abs(grid.cells[2][0].taken + grid.cells[1][1].taken + grid.cells[0][2].taken) == 3) {
			return true;
		}
		return false;
	};

	var isEnd = function() {
		if (step >= 9) {
			return true;
		}
		return false;
	};

	var showMessage = function(msg) {
		message.innerHTML = msg;
	};

	var draw = function(x, y) {
		var value = grid.cells[x][y].taken;
		var res = grid.res.x;
		var size = res*2/3;

		if (value > 0) {
			io.addObj(new iio.Circle(grid.getCellCenter(x, y),size/2)
              .setStrokeStyle('#00baff',2));
		} else if (value < 0) {
			io.addObj(new iio.XShape(grid.getCellCenter(x, y),size)
              .setStrokeStyle('red',2));
		}
	};

	var best = function() {
		var bestX;
		var bestY;
		var bestV = 0;

		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if (grid.cells[x][y].taken == 0) {
					grid.cells[x][y].taken = 1;
					step++;
					if (check(x, y)) {
						step--;
						grid.cells[x][y].taken = 0;
						return {'x':x,'y':y,'v':1000};
					} else if (isEnd()) {
						step--;
						grid.cells[x][y].taken = 0;
						return {'x':x,'y':y,'v':0};
					} else {
						var val = worst().v;
						step--;
						grid.cells[x][y].taken = 0;
						if (bestX == null || val >= bestV) {
							bestX = x;
							bestY = y;
							bestV = val;
						}
					}
				}
			}
		}
		return {'x':bestX, 'y':bestY, 'v':bestV};
	};

	var worst = function() {
		var bestX;
		var bestY;
		var bestV = 0;

		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if (grid.cells[x][y].taken == 0) {
					grid.cells[x][y].taken = -1;
					step++;
					if (check(x, y)) {
						step--;
						grid.cells[x][y].taken = 0;
						return {'x':x,'y':y,'v':-1000};
					} else if (isEnd()) {
						step--;
						grid.cells[x][y].taken = 0;
						return {'x':x,'y':y,'v':0};
					} else {
						var val = best().v;
						step--;
						grid.cells[x][y].taken = 0;
						if (bestX == null || val <= bestV) {
							bestX = x;
							bestY = y;
							bestV = val;
						}
					}
				}
			}
		}
		return {'x':bestX, 'y':bestY, 'v':bestV};
	};

	var computer = function() {
		var b = best();
		var x = b.x;
		var y = b.y;

		grid.cells[x][y].taken = 1;
		step++;
		draw(x, y);

		if (check(x, y)) {
			gameOver();
			showMessage("你输了！");
		} else if (isEnd()) {
			gameOver();
			showMessage("平局！");
		} else {
			//resetButton.style.display = "inline-block";
			resetButton.innerHTML = "重新开始";
		}
	};

	var player = function(event) {
		var c = grid.getCellAt(io.getEventPosition(event),true);
		var x = c.x;
		var y = c.y;

		if (grid.cells[x][y].taken == 0) {
			grid.cells[x][y].taken = -1;
			step++;
			draw(x, y);

			if (check(x, y)) {
				gameOver();
				showMessage("你赢了！");
			} else if (isEnd()) {
				gameOver();
				showMessage("平局！");
			} else {
				computer();
				//resetButton.style.display = "inline-block";
			}
		}
	};

	var gameOver = function() {
		canvas.removeEventListener("mousedown", player);

		resetButton.innerHTML = "再来一局";
		resetButton.style.display = "inline-block"
		resetButton.addEventListener("click", function(event) {
			grid.resetCells();
			step = 0;
			showMessage("谁先来...");
			meBtn.style.display = "inline-block";
			computerBtn.style.display = "inline-block";
			resetButton.style.display = "none";
			start();
		});

		metaWrap.className = "highlight";
	};

	var start = function() {
		init();

		computerBtn.addEventListener("click", function(event) {
			metaWrap.className = "";
			meBtn.style.display = "none";
			computerBtn.style.display = "none";
			showMessage("轮到你了...");

			init();
			computer();
			canvas.addEventListener("mousedown", player);
		});
		meBtn.addEventListener("click", function(event) {
			metaWrap.className = "";
			meBtn.style.display = "none";
			computerBtn.style.display = "none";
			showMessage("你先来...");

			canvas.addEventListener("mousedown", player);
		});
	};

	start();
}