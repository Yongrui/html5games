/**
 * Created with JetBrains WebStorm.
 * User: Yongrui
 * Date: 13-10-1
 * Time: 下午12:31
 * To change this template use File | Settings | File Templates.
 */

var game = {
    canvas: document.getElementById("canvas"),
    ctx: document.getElementById("canvas").getContext("2d"),
    cellCount: 9,
    cellWidth: 30,
    lineCount: 5,
    bubbleRadius: 12,
    mode: 7,
    colors: ["red", "#039518", "#ff00dc", "#ff6a00", "gray", "#0094ff", "#d2ce00"],
    actions: {},
    play: function(name, action, interval) {
        var me = this;
        this.actions[name] = setInterval(function() {
            action();
            me.draw();
        }, interval || 1);
    },
    stop: function(name) {
        clearInterval(this.actions[name]);
        this.draw();
    },
    start: function() {
        this.map.init();
        this.ready.init();
        this.draw();
        this.canvas.onclick = this.onclick;
    },
    over: function() {
        var startX = game.cellWidth * 10 + game.map.startX;
        var startY = game.map.startY + 100;
        var overMsg = new Message(startX, startY, "GAME OVER!", "OVER");
        game.msg.removeMessage("OVER");
        game.msg.addMessage(overMsg);
    },
    draw: function() {
        this.ctx.clearRect(0, 0, 400, 600);
        this.ctx.save();
        this.map.draw();
        this.ready.draw();
        this.score.draw();
        this.msg.draw();
        this.ctx.restore();
    },
    clicked: null,
    isMoving: function() {
        return this.ready.isMoving || this.map.isMoving;
    },
    onclick: function(e) {
        if (game.isMoving()) {
            return;
        }
        var px = (e.offsetX || (e.clientX - game.canvas.offsetLeft)) - game.map.startX;
        var py = (e.offsetY || (e.clientX - game.canvas.offsetTop)) - game.map.startY;
        if (px < 0 || py < 0 || px > game.map.width || py > game.map.height) {
            return;
        }
        var x = parseInt(px / game.cellWidth);
        var y = parseInt(py / game.cellWidth);

        var bubble = game.map.getBubble(x, y);
        if (bubble.color) {
            if (this.clicked) {
                if (this.clicked.x == x && this.clicked.y == y) {
                    return;
                }
                this.clicked.stop();
            }
            this.clicked = bubble;
            bubble.play();
        } else {
            if (this.clicked) {
                this.clicked.stop();
                game.map.move(this.clicked, bubble);
                this.clicked = null;
            }
        }
    },
    getRandom: function(max) {
        return parseInt(Math.random() * 1000000 % max);
    }
};

game.msg = {
    messages: [],
    draw: function() {
        this.messages.forEach(function(msg) {
            msg.show();
        });
    },
    addMessage: function(msg) {
        this.messages.push(msg);
    },
    removeMessage: function(tag) {
        for (var i = 0; i < this.messages.length; i++) {
            if (this.messages[i].getTag() == tag) {
                this.messages.splice(i, 1);
            }
        }
    }
};

game.score = {
    basic: 0,
    operate: 0,
    star1: 0,
    star2: 0,
    boom: 0,
    score: 0,
    draw: function() {
        var startX = game.cellWidth * 10 + game.map.startX;
        var startY = game.map.startY;
        var scoreMsg = new Message(startX, startY, "SCORE: " + this.score, "SCORE");
        scoreMsg.show();
    },
    addScore: function(length) {
        switch (length) {
            case 5:
                this.basic++;
                break;
            case 6:
                this.star1++;
                break;
            case 7:
                this.star2++;
                break;
            default:
                this.boom++;
                break;
        }
        this.score = this.basic * 5 + this.star1 * 8 + this.star2 * 10 + this.boom * 20;
        this.draw();
        console.log(this.score);
    }
};

game.map = {
    startX: 40.5,
    startY: 60.5,
    width: game.cellCount * game.cellWidth,
    height: game.cellCount * game.cellWidth,
    bubbles: [],
    init: function() {
        for (var i = 0; i < game.cellCount; i++) {
            var row = [];
            for (var j = 0; j < game.cellCount; j++) {
                row.push(new Bubble(j, i, null));
            }
            this.bubbles.push(row);
        }
    },
    draw: function() {
        var ctx = game.ctx;
        ctx.save();
        ctx.translate(this.startX, this.startY);
        ctx.beginPath();
        for (var i = 0; i <= game.cellCount; i++) {
            // vertical lines
            var p1 = i * game.cellWidth;
            ctx.moveTo(p1, 0);
            ctx.lineTo(p1, this.height);

            // horizontal lines
            var p2 = i * game.cellWidth;
            ctx.moveTo(0, p2);
            ctx.lineTo(this.width, p2);
        }

        ctx.strokeStyle = "#555";
        ctx.stroke();

        // draw bubbles
        this.bubbles.forEach(function(row) {
            row.forEach(function(bubble) {
                bubble.draw();
            });
        });
        ctx.restore();
    },
    clearLine: function(x1, y1, color, isClick) {
        if (this.isEmpty(x1, y1)) {
            if (isClick) {
                game.ready.flyIn();
            }
            return;
        }
        var curBubble = this.getBubble(x1, y1);
        var arr1, arr2, arr3, arr4;
        arr1 = this.bubbles[y1];
        arr2 = [];
        for (var y = 0; y < game.cellCount; y++)
            arr2.push(this.getBubble(x1, y));

        arr3 = [curBubble];
        arr4 = [curBubble];
        for (var i = 1; i < game.cellCount ; i++) {
            if (x1 - i >= 0 && y1 - i >= 0)
                arr3.unshift(this.getBubble(x1 - i, y1 - i));
            if (x1 + i < game.cellCount && y1 + i < game.cellCount)
                arr3.push(this.getBubble(x1 + i, y1 + i));

            if (x1 - i >= 0 && y1 + i < game.cellCount)
                arr4.push(this.getBubble(x1 - i, y1 + i));
            if (x1 + i < game.cellCount && y1 - i >= 0)
                arr4.unshift(this.getBubble(x1 + i, y1 - i));
        }

        var line1 = getLine(arr1);
        var line2 = getLine(arr2);
        var line3 = getLine(arr3);
        var line4 = getLine(arr4);

        var line = line1.concat(line2).concat(line3).concat(line4);
        if (line.length < 5) {
            if (isClick) {
                game.ready.flyIn();
            }
        } else {
            var me = this;
            var i = 0;

            game.play("clearline", function () {
                if (i == line.length) {
                    game.score.addScore(line.length);
                    game.stop("clearline");
                    me.isMoving = false;
                    //game.ready.flyIn();
                    return;
                }
                me.isMoving = true;
                var p = line[i];
                me.setBubble(p.x, p.y, null);
                i++;
            }, 100);
        }

        function getLine(bubbles) {
            var line = [];
            for (var i = 0; i < bubbles.length; i++) {
                var b = bubbles[i];
                if (b.color == color) {
                    line.push({ "x": b.x, "y": b.y });
                }
                else {
                    if (line.length < 5)
                        line = [];
                    else
                        return line;
                }
            }
            if (line.length < 5)
                return [];
            return line;
        }
    },
    isMoving: false,
    move: function(bubble, target) {
        var startX = game.cellWidth * 10 + game.map.startX;
        var startY = game.map.startY + 50;
        var path = this.search(bubble.x, bubble.y, target.x, target.y);
        if (!path) {
            var hitMsg = new Message(startX, startY, "Hit something", "GO");
            game.msg.removeMessage("GO");
            game.msg.addMessage(hitMsg);
            return;
        }
        var goMsg = new Message(startX, startY, "("+bubble.x+", "+bubble.y+") TO ("+target.x+", "+target.y+")", "GO");
        game.msg.removeMessage("GO");
        game.msg.addMessage(goMsg);
        var me = this;
        var name = "move_" + bubble.x + "_" + bubble.y;
        var color = bubble.color;
        var n = path.length - 1;
        var i = 0;
        game.play(name, function() {
            if (i > n) {
                game.stop(name);
                me.isMoving = false;
                me.clearLine(target.x, target.y, color, true);
                return;
            }
            me.isMoving = true;
            path.forEach(function(cell) {
                me.setBubble(cell.x, cell.y, null);
            });
            var curCell = path[i];
            me.setBubble(curCell.x, curCell.y, color);
            i++;
        }, 50);
    },
    search: function(x1, y1, x2, y2) {
        var me = this;
        var closed = [];
        var opened = [];
        var path = [];

        getPath();
        return path;

        function insertToOpened(cell) {
            var f = cell.g + cell.h;
            var i = 0;
            for (i = 0; i < opened.length; i++) {
                if (f <= opened[i].g + opened[i].h) break;
            }
            opened.splice(i, 0, cell);
        }

        function isInClosed(cell) {
            return closed.some(function(item) {
                return (cell.x == item.x && cell.y == item.y)
            });
        }

        function indexInOpened(cell) {
            var index = -1;
            for (var i = 0; i < opened.length; i++) {
                if (cell.x == opened[i].x && cell.y == opened[i].y) {
                    index = i;
                    break;
                }
            }
            return index;
        }

        function getPath() {
            if (!me.isValid(x2, y2)) return;
            var fromCell = new Cell(x1, y1, null);
            var targetCell = new Cell(x2, y2, null);
            insertToOpened(fromCell);
            do
            {
                var curCell = opened[0];
                closed.push(curCell);
                opened.splice(0, 1);
                if (curCell.x == targetCell.x && curCell.y == targetCell.y) {
                    var c = curCell;
                    while (c != null) {
                        path.splice(0, 0, c);
                        c = c.parent;
                    }
                    return;
                }

                var adjArr = [];
                if (me.isValid(curCell.x, curCell.y-1) && me.isEmpty(curCell.x, curCell.y-1)) {
                    adjArr.push(new Cell(curCell.x, curCell.y-1, null));
                }
                if (me.isValid(curCell.x-1, curCell.y) && me.isEmpty(curCell.x-1, curCell.y)) {
                    adjArr.push(new Cell(curCell.x-1, curCell.y, null));
                }
                if (me.isValid(curCell.x, curCell.y+1) && me.isEmpty(curCell.x, curCell.y+1)) {
                    adjArr.push(new Cell(curCell.x, curCell.y+1, null));
                }
                if (me.isValid(curCell.x+1, curCell.y) && me.isEmpty(curCell.x+1, curCell.y)) {
                    adjArr.push(new Cell(curCell.x+1, curCell.y, null));
                }

                for (var i = 0; i < adjArr.length; i++) {
                    var cell = adjArr[i];
                    if (isInClosed(cell)) continue;
                    var index = indexInOpened(cell);
                    if (index == -1) {
                        cell.parent = curCell;
                        cell.g = curCell.g + 1;
                        cell.h = Math.abs(targetCell.x-cell.x) + Math.abs(targetCell.y-cell.y);
                        insertToOpened(cell);
                    } else {
                        cell = opened[index];
                        if (curCell.g + 1 < cell.g) {
                            cell.g = curCell.g + 1;
                            opened.splice(index, 1);
                            insertToOpened(cell);
                        }
                    }
                }
            } while(opened.length > 0);

            if (path.length == 0) path = null;
        }
    },
    addBubble: function(bubble) {
        var thisBubble = this.getBubble(bubble.x, bubble.y);
        thisBubble.color = bubble.color;
    },
    getBubble: function(x, y) {
        if (x < 0 || y < 0 || x >= game.cellCount || y >= game.cellCount) return null;
        return this.bubbles[y][x];
    },
    setBubble: function(x, y, color) {
        this.getBubble(x, y).color = color;
    },
    getEmptyBubbles: function() {
        var empties = [];
        this.bubbles.forEach(function(row) {
            row.forEach(function(bubble) {
                if (!bubble.color) {
                    empties.push(new Bubble(bubble.x, bubble.y, null));
                }
            });
        });
        if (empties.length < 3) {
            return [];
        }

        var result = [];
        var used = [];
        while (result.length < 3) {
            var isUsed = false;
            var ra = game.getRandom(empties.length);
            for (m = 0; m < used.length; m++) {
                isUsed = (ra === used[m]);
                if (isUsed) break;
            }
            if (!isUsed) {
                result.push(empties[ra]);
                used.push(ra);
            }
        }
        return result;
    },
    isEmpty: function(x, y) {
        var bubble = this.getBubble(x, y);
        return !bubble.color;
    },
    isValid: function(x, y) {
        return !(x < 0 || y < 0 || x >= game.cellCount || y >= game.cellCount);
    }
};

game.ready = {
    startX: 40.5,
    startY: 20.5,
    width: game.cellWidth * 3,
    height: game.cellWidth,
    bubbles: [],
    init: function() {
        this.generate();
        var me = this;
        me.flyIn();
    },
    generate: function() {
        for (var i = 0; i < 3; i++) {
            var color = game.colors[game.getRandom(game.mode)];
            this.bubbles.push(new Bubble(i, 0, color));
        }
    },
    draw: function() {
        var ctx = game.ctx;
        ctx.save();
        ctx.translate(this.startX, this.startY);
        ctx.beginPath();
        ctx.strokeStyle = "#555";
        ctx.strokeRect(0, 0, this.width, this.height);
        ctx.stroke();
        // draw ready bubbles
        this.bubbles.forEach(function(bubble) {
            bubble.draw();
        });
        ctx.restore();
    },
    isMoving: false,
    flyIn: function() {
        var empties = game.map.getEmptyBubbles();
        if (empties.length < 3) {
            // game over
            game.over();
            return;
        }
        var me = this;
        var status = [0, 0, 0];
        game.play("flyin", function() {
            if (status[0] && status[1] && status[2]) {
                game.stop("flyin");
                me.isMoving = false;
                status = [0, 0, 0];
                me.bubbles = [];
                me.generate();
                for (var i = 0; i < 3; i++) {
                    game.map.clearLine(empties[i].x, empties[i].y, me.bubbles[i].color, false);
                }
                if (game.map.getEmptyBubbles().length < 3) {
                    game.over();
                }
                return;
            }
            me.isMoving = true;
            for (var i = 0; i < me.bubbles.length; i++) {
                if (status[i]) {
                    continue;
                }
                var target = empties[i];
                var x2 = target.px + game.map.startX - me.startX;
                var y2 = target.py + game.map.startY - me.startY;

                var current = me.bubbles[i];

                var step = 2;
                if (current.px < x2) {
                    current.py = ((y2 - current.py) / (x2 - current.px)) * step + current.py;
                    current.px +=  step;
                    if (current.px > x2) {
                        current.px = x2;
                    }
                } else if (current.px > x2) {
                    current.py = ((y2 - current.py) / (current.px - x2)) * step + current.py;
                    current.px -= step;
                    if (current.px < x2) {
                        current.px = x2;
                    }
                } else {
                    current.py += step;
                }

                if (current.py > y2) {
                    current.py = y2;
                }

                if (current.px == x2 && current.py == y2) {
                    status[i] = 1;
                    current.x = target.x;
                    current.y = target.y;
                    game.map.addBubble(current);
                }
            }
        }, 10);
    }
};

var Cell = function(x, y, parent) {
    this.x = x;
    this.y = y;
    this.g = 0;
    this.h = 0;
    this.parent = parent;
};

var Message = function(x, y, msg, tag) {
    this.x = x;
    this.y = y;
    this.msg = msg;
    this.tag = tag;
    this.font = "24px Arial";
    this.strokeStyle = "#456";
    this.fillStyle = "#fefefe";
};

Message.prototype.show = function() {
    var ctx = game.ctx;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.clearRect(0, 0, 200, 400);
    ctx.strokeStyle = this.strokeStyle;
    ctx.font = this.font;
    ctx.fillStyle = this.fillStyle;
    ctx.fillText(this.msg, 0, 30);
    ctx.stroke();
    ctx.restore();
};

Message.prototype.getTag = function() {
    return this.tag;
};

var Bubble = function(x, y, c) {
    this.x = x;
    this.y = y;
    this.color = c;
    this.light = 10;
    this.px = game.cellWidth * (this.x + 1) - game.cellWidth / 2;
    this.py = game.cellWidth * (this.y + 1) - game.cellWidth / 2;
};

Bubble.prototype.draw = function() {
    if (!this.color) {
        return;
    }
    var ctx = game.ctx;
    ctx.beginPath();
    var gradient = ctx.createRadialGradient(this.px - 5, this.py - 5, 0, this.px, this.py, this.light);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, this.color);
    ctx.arc(this.px, this.py, 11, 0, Math.PI * 2, true);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.stroke();
};

Bubble.prototype.play = function() {
    var me = this;
    var isUp = true;
    game.play("light_"+this.x+"_"+this.y, function() {
        if (isUp) {
            me.light++;
        }
        if (!isUp) {
            me.light--;
        }
        if (me.light == 30) {
            isUp = false;
        }
        if (me.light == 10) {
            isUp = true;
        }
    }, 50);
};

Bubble.prototype.stop = function() {
    var me = this;
    game.stop("light_"+this.x+"_"+this.y);
    game.play("restore_"+this.x+"_"+this.y, function() {
        if (me.light > 10) {
            me.light--;
        } else {
            me.light = 10;
            game.stop("restore_"+me.x+"_"+me.y);
        }
    }, 50);
};

