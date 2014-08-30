define([
    "Game/Client/View/Abstract/Layer",
	"Lib/Vendor/Pixi",
],

function (Parent, PIXI) {
    
    function Layer (name, parallaxSpeed) {
        Parent.call(this, name, parallaxSpeed);
        this.container = new PIXI.DisplayObjectContainer();
    }

    Layer.prototype = Object.create(Parent.prototype);

    Layer.prototype.getContainer = function() {
        return this.container;
    };

    Layer.prototype.show = function() {
        this.container.visible = true;
    };

    Layer.prototype.hide = function() {
        this.container.visible = false;
    };

    Layer.prototype.addMesh = function(mesh) {
        this.container.addChild(mesh);
    };

    Layer.prototype.removeMesh = function(mesh) {
        this.container.removeChild(mesh);
    };

    Layer.prototype.createMesh = function (texturePath, callback, options) {

        var texture = PIXI.Texture.fromImage(texturePath);

        var mesh = new PIXI.Sprite(texture);

        if(options) this.updateMesh(mesh, options);

        callback(mesh);
    };

    Layer.prototype.createAnimatedMesh = function (texturePaths, callback, options) {
        var textures = [];
        for (var i = 0; i < texturePaths.length; i++) {
            var texture = PIXI.Texture.fromImage(texturePaths[i]);
            texture.width = options.width;
            texture.height = options.height;
            PIXI.texturesToUpdate.push(texture);
            textures.push(texture);
        }

        var mesh = new PIXI.MovieClip(textures);
        if(options) this.updateMesh(mesh, options);

        mesh.animationSpeed = 0.5;

        mesh.play();

        callback(mesh);
    }

    Layer.prototype.updateMesh = function(mesh, options) {
        if (options.x) mesh.position.x = options.x;
        if (options.y) mesh.position.y = options.y;
        if (options.rotation) mesh.rotation = options.rotation;
        if (options.alpha) mesh.alpha = options.alpha;
        if (options.width) mesh.width = options.width;
        if (options.height) mesh.height = options.height;
        if (options.xScale) mesh.width = Math.abs(mesh.width) * options.xScale;
        if (options.yScale) mesh.scale.y = options.yScale;
        if (options.visible === true || options.visible === false) mesh.visible = options.visible;
        if (options.pivot) mesh.pivot = new PIXI.Point(options.pivot.x, options.pivot.y);
    };

    Layer.prototype.addFilter = function(mesh, filterName, options) {

        if (!AVAILABLE_MESH_FILTERS.hasOwnProperty(filterName)) {
            throw new Exception('Filter ' + filterName + ' is not available');
        }
        
        var MeshFilter = AVAILABLE_MESH_FILTERS[filterName];
        var filter = new MeshFilter();

        switch (filterName) {
            case 'desaturate':
                if (options.amount) filter.gray = options.amount;
                break;

            case 'blur':
                if (options.blurX) filter.blurX = options.blurX;
                if (options.blurY) filter.blurY = options.blurY;
                break;

            case 'colorRangeReplace':
                if (options.minColor) filter.minColor = options.minColor;
                if (options.maxColor) filter.maxColor = options.maxColor;
                if (options.newColor) filter.newColor = options.newColor;
                if (options.brightnessOffset) filter.brightnessOffset = options.brightnessOffset;
                break;

            case 'pixelate':
                if (options.sizeX) filter.size.x = options.sizeX;
                if (options.sizeY) filter.size.y = options.sizeY;
                break;

            default:
                break;
        }

        var filters = mesh.filters;

        if(!filters) {
            filters = [];
        } else {
            // ensure uniqueness of filter by name
            this.removeFilter(mesh, filterName);
        }

        filters.push(filter);
        mesh.filters = filters;
    };

    Layer.prototype.removeFilter = function(mesh, filterName) {

        var filters = mesh.filters;

        if(!filters) {
            return;
        }

        var MeshFilter = AVAILABLE_MESH_FILTERS[options.filter];

        filters = filters.filter(function(filter){
            return !filter instanceof MeshFilter;
        });

        mesh.filters = filter;
    };


    return Layer;
});

