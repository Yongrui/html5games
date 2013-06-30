var TicTacToe = function(io) {

	var step = 0;

	var grid = io.addObj(new iio.Grid(0,0,3,3,120).setStrokeStyle("white"));

	for (var x = 0; x < 3; x++) {
		for (var y = 0; y < 3; y++) {
			grid.cells[x][y].taken = 0;
		}
	}

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
		alert(msg);
	};

	var draw = function(x, y) {
		var value = grid.cells[x][y].taken;
		if (value > 0) {
			io.addObj(new iio.Circle(grid.getCellCenter(x, y),40)
              .setStrokeStyle('#00baff',2));
		} else if (value < 0) {
			io.addObj(new iio.XShape(grid.getCellCenter(x, y),80)
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
			showMessage("你输了！");
		} else if (isEnd()) {
			showMessage("平局！");
		} else {
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
				showMessage("你赢了！");
			} else if (isEnd()) {
				showMessage("平局！");
			} else {
				computer();
			}
		}
	};
	document.getElementById("computer").addEventListener("click", function() {
		computer();
		this.disabled = true;
	});
	document.getElementById("replay").addEventListener("click", function() {
		window.location = window.location.href;
	});
	io.canvas.addEventListener("mousedown", player);
}
