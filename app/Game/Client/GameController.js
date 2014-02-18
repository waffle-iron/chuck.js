define([
    "Game/Core/GameController",
    "Lib/Vendor/Box2D",
    "Game/Client/Physics/Engine", 
    "Game/Client/View/ViewManager", 
    "Game/Client/Control/PlayerController", 
    "Lib/Utilities/NotificationCenter",
    "Lib/Utilities/RequestAnimFrame",
    "Game/Config/Settings",
    "Game/Client/GameObjects/GameObject",
    "Game/Client/GameObjects/Doll",
    "Game/Client/View/DomController"
],

function (Parent, Box2D, PhysicsEngine, ViewManager, PlayerController, NotificationCenter, requestAnimFrame, Settings, GameObject, Doll, DomController) {

    function GameController () {
        this.view = ViewManager.createView();
        this.me = null;

        NotificationCenter.on("game/toggleInfo", this.toggleInfo, this);

        Parent.call(this);
    }

    GameController.prototype = Object.create(Parent.prototype);


    GameController.prototype.destruct = function() {
        //destroy box2d world etc.
    };

    GameController.prototype.getMe = function () {
        return this.me;
    }

    GameController.prototype.update  = function () {
        DomController.statsBegin();

        requestAnimFrame(this.update.bind(this));

        this.physicsEngine.update();
        
        if(this.me) {
            this.me.update();
        }

        for (var i = 0; i < this.gameObjects.animated.length; i++) {
            this.gameObjects.animated[i].render();
        }

        this.view.render();

        DomController.statsEnd();
    }

    GameController.prototype.onWorldUpdate = function (updateData) {

        var body = this.physicsEngine.world.GetBodyList();
        do {
            var userData = body.GetUserData();
            if (userData instanceof GameObject) {
                var gameObject = userData;
                if(updateData[gameObject.uid]) {
                    var update = updateData[gameObject.uid];
                    body.SetAwake(true);
                    body.SetPosition(this.centerBetween(update.p, body.GetPosition()));
                    body.SetAngle(update.a);
                    body.SetLinearVelocity(update.lv);
                    body.SetAngularVelocity(update.av);

                    if (gameObject instanceof Doll) {
                        gameObject.setActionState(update.as);
                        gameObject.lookAt(update.laxy.x, update.laxy.y);
                    }
                }
            }
            
        } while (body = body.GetNext());

    }

    GameController.prototype.centerBetween = function(n, o) {
        var x, y;

        if(n.x > o.x) {
            x = o.x + (n.x - o.x) / 2;
        } else {
            x = o.x - (o.x - n.x) / 2;
        }

        if(n.y > o.y) {
            y = o.y + (n.y - o.y) / 2;
        } else {
            y = o.y - (o.y - n.y) / 2;
        }

        return {x:x, y:y};
    };

    GameController.prototype.onJoinMe = function (playerId) {
        this.me = this.players[playerId];
        this.me.setPlayerController(new PlayerController(this.me));
        this.view.setMe(this.me);
    }

    GameController.prototype.onSpawnPlayer = function(options) {
        var playerId = options.id,
            x = options.x,
            y = options.y;

        var player = this.players[playerId];
        player.spawn(x, y);
        this.gameObjects.animated.push(player.getDoll());
        
        if(options.holdingItemUid) {
            this.onHandActionResponse({
                itemUid: options.holdingItemUid,
                action: "grab",
                playerId: playerId
            });
        }
    }

    GameController.prototype.onHandActionResponse = function(options) {
        var player = this.players[options.playerId];

        var item = null;
        for (var i = 0; i < this.gameObjects.animated.length; i++) {
            var currentItem = this.gameObjects.animated[i];
            if(currentItem.uid == options.itemUid) {
                item = currentItem;
                break;
            }
        };

        if(item) {
            if(options.action == "throw") {
                player.throw(options.x, options.y, item);
            } else if(options.action == "grab") {
                player.grab(item);
            }            
        } else {
            console.warn("Item for joint can not be found locally. " + options.itemUid)
        }

    };

    GameController.prototype.onUpdateStats = function(options) {
        var player = this.players[options.playerId];
        player.stats = options.stats;

        // FIXME: move to canvas later
        if(player == this.me) {
            DomController.setHealth(player.stats.health);
        }
    };

    GameController.prototype.onPlayerKill = function(playerId) {
        var player = this.players[options.playerId];
        player.kill();
    };

    GameController.prototype.loadLevel = function (path) {
        Parent.prototype.loadLevel.call(this, path);
    }

    GameController.prototype.userLeft = function(user) {
        var doll = this.players[user.id].doll;
        var i = this.gameObjects.animated.indexOf(doll);
        if(i>=0) this.gameObjects.animated.splice(i, 1);

        Parent.prototype.userLeft.call(this, user);
    }

    GameController.prototype.toggleInfo = function(show) {

        var playersArray = [];
        for (var key in this.players) {
            playersArray.push(this.players[key]);
        };

        var sortedPlayers = playersArray.sort(function(a,b) {
            if(a.score > b.score) return 1;
            if(a.score < b.score) return -1;
            if(a.deaths < b.deaths) return 1;
            if(a.deaths > b.deaths) return -1;
            return 0;
        });

        function pad(string, max, alignLeft) {
            string = string.substring(0, max - 1);

            var spaces = new Array( max - string.length + 1 ).join(" ");
            if(alignLeft) {
                return string + spaces;
            } else {
                return spaces + string;
            }
        }

        var string = "" +
                     pad("#", 2, false) + " " +
                     pad("Name", 12, true) +
                     pad("Score", 6, false) +
                     pad("Deaths", 7, false) +
                     pad("Health", 7, false) +
                     "\n-----------------------------------\n";

        var lines = [];
        sortedPlayers.forEach(function(player, i) {
            var name = player == this.me ? "You" : "Player " + (Object.keys(this.players).indexOf(player.id) + 1);
            lines.push(
                pad("" + (i + 1) + ".", 2, false) + " " + 
                pad(name, 12, true) + 
                pad("" + player.stats.score, 6, false) +
                pad("" + player.stats.deaths, 7, false) +
                pad("" + parseInt(player.stats.health, 10), 7, false)
            );
        }, this);

        string += lines.join("\n");

        this.view.toggleInfo(show, string);
    };

    return GameController;
});
