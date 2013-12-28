define([
    "Game/" + GLOBALS.context + "/GameObjects/Doll",
    "Game/Config/Settings"
],


function (Doll, Settings) {

    function Player (id, physicsEngine) {
        this.physicsEngine = physicsEngine;
        this.playerController = null;
        this.doll;
        this.id = id;
        this.isSpawned = false;
        this.holdingItem = null;
    }

    Player.prototype.getDoll = function() {
        return this.doll;
    };

    Player.prototype.spawn = function (x, y) {
        this.doll = new Doll(this.physicsEngine, "doll-" + this.id);
        this.doll.spawn(x, y);
        this.isSpawned = true;
    }

    Player.prototype.getPosition = function () {
        if(!this.doll) return false;
        return this.doll.getPosition();
    }

    Player.prototype.move = function (direction) {
        this.doll.move(direction);
    }

    Player.prototype.stop = function () {
        this.doll.stop();
    }

    Player.prototype.jump = function () {
        this.doll.jump();
    }

    Player.prototype.lookAt = function (x, y) {
        if(this.doll) this.doll.lookAt(x, y);
    }

    Player.prototype.handAction = function(x, y) {
        
        if (this.holdingItem) {
            // throw
            this.doll.throw(this.holdingItem, x, y);
            this.holdingItem = null;
        } else {
            // take
            var item = this.doll.grab(x, y);
            if(item) {
                this.holdingItem = item;
            }
        }
    };

    Player.prototype.update = function () {

        if(this.doll) {
            this.doll.update();
        }

        if(this.playerController) {
            this.playerController.update();
        }
    }

    Player.prototype.destroy = function () {
        this.doll.destroy();
    }

    Player.prototype.setPlayerController = function(playerController) {
        this.playerController = playerController;
    }

    return Player;
});
