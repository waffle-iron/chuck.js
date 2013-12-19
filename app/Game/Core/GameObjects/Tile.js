define([
	"Game/" + GLOBALS.context + "/GameObjects/GameObject",
	"Lib/Vendor/Box2D",
	"Game/Config/Settings",
	"Game/" + GLOBALS.context + "/Collision/Detector"
],
 
function (Parent, Box2D, Settings, CollisionDetector) {
 
    function Tile(physicsEngine, options) {
    	this.options = options;
    	Parent.call(this, physicsEngine);
    	this.createPhysicTile(this.options);
    }

    Tile.prototype = Object.create(Parent.prototype);
 
    Tile.prototype.getBodyDef = function() {

    	var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        bodyDef.position.x = this.options.x * Settings.TILE_SIZE / Settings.RATIO;
        bodyDef.position.y = this.options.y * Settings.TILE_SIZE / Settings.RATIO;
        bodyDef.angle = this.options.r * 90 * Math.PI / 180;

        return bodyDef;
    }

    Tile.prototype.createPhysicTile = function (tile) {
        tile.r = tile.r || 0;
        var vertices = this.createVertices(tile);

        var tileShape = new Box2D.Collision.Shapes.b2PolygonShape();
        
        tileShape.SetAsArray(vertices, vertices.length);

        var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
        fixtureDef.shape = tileShape;
        fixtureDef.density = 0;
        fixtureDef.friction = Settings.TILE_FRICTION;
        fixtureDef.restitution = Settings.TILE_RESTITUTION;
        fixtureDef.isSensor = false;
        fixtureDef.userData = CollisionDetector.IDENTIFIER.TILE;

        this.body.CreateFixture(fixtureDef);
    }

    Tile.prototype.createVertices = function (tile) {
        var vs = [];

        switch(tile.s) {
            case 1:
                this.addVec(vs, -1, -1); // o o o
                this.addVec(vs,  1, -1); // o o o
                this.addVec(vs,  1,  1); // o o o
                this.addVec(vs, -1,  1); 
                break;

            case 2:
                this.addVec(vs, -1, -1); // o
                this.addVec(vs,  1,  1); // o o
                this.addVec(vs, -1,  1); // o o o
                break;

            case 3:
                this.addVec(vs, -1, -1); // o
                this.addVec(vs,  0,  1); // o
                this.addVec(vs, -1,  1); // o o
                break;

            case 4:
                this.addVec(vs, -1, -1); // o
                this.addVec(vs,  1,  0); // o o o
                this.addVec(vs,  1,  1); // o o o
                this.addVec(vs, -1,  1);
                break;

            case 5:
                this.addVec(vs,  1, -1); // o
                this.addVec(vs,  1,  1); // o
                this.addVec(vs,  0,  1); // o o
                break;

            case 6:
                this.addVec(vs,  1, -1); //     o
                this.addVec(vs,  1,  1); // o o o
                this.addVec(vs, -1,  1); // o o o
                this.addVec(vs, -1,  0);
                break;

            case 7:
                this.addVec(vs, -1, 0); //
                this.addVec(vs,  0, 1); // o
                this.addVec(vs, -1, 1); // o o
                break;

            case 8:
                this.addVec(vs, -1, -1); // o o
                this.addVec(vs,  0, -1); // o o o
                this.addVec(vs,  1,  0); // o o o
                this.addVec(vs,  1,  1); 
                this.addVec(vs, -1,  1);
                break;

            default:
                break;
        }

        return vs;
    }

    Tile.prototype.mkArg = function (multiplier) {
        return Settings.TILE_SIZE / 2 / Settings.RATIO * multiplier;
    }

    Tile.prototype.addVec = function (vs, m1, m2) {
        return vs.push(new Box2D.Common.Math.b2Vec2(this.mkArg(m1), this.mkArg(m2)));
    }
 
    return Tile;
 
});