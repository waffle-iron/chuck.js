define([
	"Game/Core/GameObjects/Item",
	"Game/Config/Settings",
    "Lib/Utilities/NotificationCenter",
    "Game/Client/View/Abstract/Layer"
],
 
function (Parent, Settings, Nc, Layer) {

	"use strict";
 
    function Item(physicsEngine, uid, options) {
        this.layerId = Layer.ID.ITEM;
    	Parent.call(this, physicsEngine, uid, options);
    }

    Item.prototype = Object.create(Parent.prototype);
 
    Item.prototype.createMesh = function() {
    	var self = this;

    	var texturePath = Settings.GRAPHICS_PATH
    				+ Settings.GRAPHICS_SUBPATH_ITEMS
    				+ this.options.category + '/'
    				+ this.options.image;

    	var callback = function(mesh) {
    		self.mesh = mesh;
            Nc.trigger(Nc.ns.client.view.mesh.add, self.layerId, mesh);
    	}
   
        Nc.trigger(Nc.ns.client.view.mesh.create,
            this.layerId,
            texturePath, 
            callback,
            {
                width: this.options.width, 
                height: this.options.height, 
                pivot: {
                    x: this.options.width / 2,
                    y: this.options.height
                }
            }
        );
    };

    Item.prototype.destroy = function() {
        Nc.trigger(Nc.ns.client.view.mesh.remove, this.layerId, this.mesh);
        Parent.prototype.destroy.call(this);
    };

    Item.prototype.render = function() {

        Nc.trigger(Nc.ns.client.view.mesh.update,
            this.layerId,
            this.mesh,
            {
                x: this.body.GetPosition().x * Settings.RATIO,
                y: this.body.GetPosition().y * Settings.RATIO,
                rotation: this.body.GetAngle()
            }
        );
    }

    Item.prototype.flip = function(direction) {
        var oldFlipDirection = this.flipDirection;
        
        Parent.prototype.flip.call(this, direction);

        if(oldFlipDirection != direction) {
            Nc.trigger(Nc.ns.client.view.mesh.update,
                this.layerId,
                this.mesh,
                {
                    xScale: direction
                }
            );
        }
    };
 
    return Item;
 
});