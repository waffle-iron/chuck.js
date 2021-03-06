define([
	"Game/Core/Control/PlayerController",
	"Lib/Utilities/NotificationCenter",
    "Lib/Utilities/Protocol/Parser",
    "Game/Config/Settings"
],
 
function(Parent, Nc, Parser, Settings) {

    "use strict";
 
    function PlayerController(player) {

    	Parent.call(this, player);
    }

    PlayerController.prototype = Object.create(Parent.prototype);

    /* 
     * retrieves move (and other) commands from client and executes them at the server 
     */ 
    PlayerController.prototype.applyCommand = function(options) {
        // FIXME: remove this function and use ProtocolHelper.applyCommand() instead
        // Don't forget to change the function names to on...
        var message;
        if (typeof options == "string") {
            message = Parser.decode(options);
        } else {
            message = options;
        }
        
        for (var command in message) {
            this[command].call(this, message[command]);
        }
    };

    PlayerController.prototype.handActionRequest = function(options) {
        options.x = parseFloat(options.x) || 0.0;
        options.y = parseFloat(options.y) || 0.0;
        options.av = parseFloat(options.av) || 0.0;
        if (options) this.player.handActionRequest(options);
    };

    PlayerController.prototype.suicide = function() {
        this.player.suicide();
    };

    PlayerController.prototype.mePositionStateOverride = function(update) {

        if(!this.player.isSpawned()) {
            // if someone still falls but is dead on the server already
            return; 
        }

        var difference = {
            x: Math.abs(update.p.x - this.player.doll.body.GetPosition().x),
            y: Math.abs(update.p.y - this.player.doll.body.GetPosition().y)
        };

        if(difference.x < Settings.PUNKBUSTER_DIFFERENCE_METERS &&
           difference.y < Settings.PUNKBUSTER_DIFFERENCE_METERS) {
            this.player.doll.updatePositionState(update);
        } else {
            // HARD UPDATE FOR SELF
            console.log(this.player.user.options.nickname + " is cheating.");

            var body = this.player.doll.body;

            var options = {
                p: body.GetPosition(),
                lv: body.GetLinearVelocity()
            };

            Nc.trigger(Nc.ns.channel.to.client.user.gameCommand.send + this.player.id, "positionStateReset", options);
        }
    };

    return PlayerController;
 
});