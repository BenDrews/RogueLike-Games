Game.DATASTORE.MAP = {};

Game.Map = function (mapTileSetName){

  this._tiles = Game.MapTileSets[mapTileSetName].getMapTiles();

  this.attr = {
    _id: Game.util.uniqueId(),
    _mapTileSetName: mapTileSetName,
    _width: this._tiles.length,
    _height: this._tiles[0].length,
    _entitiesByLocation: {},
    _locationsByEntity: {}
  };

  this._fov = null;
  this.setUpFov();

  Game.DATASTORE.MAP[this.attr._id] = this;
};

Game.Map.prototype.setUpFov = function () {
  var map = this;
  this._fov = new ROT.FOV.RecursiveShadowcasting(function(x, y) {
    return !map.getTile(x,y).isOpaque();
  }, {topology: 8});
};

Game.Map.prototype.getFov = function () {
  return this._fov;
};

Game.Map.prototype.getId = function () {
  return this.attr._id;
};

Game.Map.prototype.getWidth = function () {
  return this.attr._width;
};

Game.Map.prototype.getHeight = function () {
  return this.attr._height;
};

Game.Map.prototype.getTile = function (x_or_pos,y) {
  var useX = x_or_pos,useY = y;
  if (typeof x_or_pos == 'object') {
    useX = x_or_pos.x;
    useY = x_or_pos.y;
  }
  if ((useX < 0) || (useX >= this.attr._width) || (useY<0) || (useY >= this.attr._height)) {
    return Game.Tile.nullTile;
  }
  return this._tiles[useX][useY] || Game.Tile.nullTile;
};

Game.Map.prototype.addEntity = function (ent,pos) {
  this.attr._entitiesByLocation[pos.x+","+pos.y] = ent.getId();
  this.attr._locationsByEntity[ent.getId()] = pos.x+","+pos.y;
  ent.setMap(this);
  ent.setPos(pos);
};

Game.Map.prototype.updateEntityLocation = function (ent) {
  var origLoc = this.attr._locationsByEntity[ent.getId()];
  if (origLoc) {
    this.attr._entitiesByLocation[origLoc] = undefined;
  }
  var pos = ent.getPos();
  this.attr._entitiesByLocation[pos.x+","+pos.y] = ent.getId();
  this.attr._locationsByEntity[ent.getId()] = pos.x+","+pos.y;
};

Game.Map.prototype.getEntity = function (x_or_pos,y) {
  var useX = x_or_pos,useY=y;
  if (typeof x_or_pos == 'object') {
    useX = x_or_pos.x;
    useY = x_or_pos.y;
  }

  var entId = this.attr._entitiesByLocation[useX+','+useY];
  if (entId) { return Game.DATASTORE.ENTITY[entId]; }
  return false;
};

Game.Map.prototype.extractEntity = function (ent) {
  this.attr._entitiesByLocation[ent.getX()+","+ent.getY()] = undefined;
  this.attr._locationsByEntity[ent.getId()] = undefined;
  return ent;
};
Game.Map.prototype.extractEntityAt = function (x_or_pos,y) {
  var ent = this.getEntity(x_or_pos,y);
  if (ent) {
    this.attr._entitiesByLocation[ent.getX()+","+ent.getY()] = undefined;
    this.attr._locationsByEntity[ent.getId()] = undefined;
  }
  return ent;
};

Game.Map.prototype.getEntitiesNearby = function (radius,x_or_pos,y) {
  var useX = x_or_pos,useY = y;
  if (typeof x_or_pos == 'object') {
    useX = x_or_pos.x;
    useY = x_or_pos.y;
  }
  var entLocs = Object.keys(this.attr._entitiesByLocation);
  var foundEnts = [];
  if (entLocs.length < radius*radius*4) {
    for (var i = 0; i < entLocs.length; i++) {
      var el = entLocs[i].split(',');
      if((Math.abs(el[0]-useX) <= radius) && (Math.abs(el[1]-useY) <= radius)) {
        foundEnts.push(Game.DATASTORE.ENTITY[this.attr._entitiesByLocation[entLocs[i]]]);
      }
    }
  } else {
    for (var cx = radius*-1; cx<= radius; cx++) {
      for (var cy = radius*-1; cy <= radius; cy++) {
        var entId = this.getEntity(useX+cx,useY+cy);
        if (entId) {
          foundEnts.push(Game.DATASTORE.ENTITY[entId]);
        }
      }
    }
  }
  return foundEnts;
};

Game.Map.prototype.renderOn = function (display,camX,camY,renderOptions) {
  var opt = renderOptions || {};

 var checkCellsVisible = opt.visibleCells !== undefined;
 var visibleCells = opt.visibleCells || {};
 var showVisibleEntities = (opt.showVisibleEntities !== undefined) ? opt.showVisibleEntities : true;
 var showVisibleTiles = (opt.showVisibleTiles !== undefined) ? opt.showVisibleTiles : true;

 var checkCellsMasked = opt.maskedCells !== undefined;
 var maskedCells = opt.maskedCells || {};
 var showMaskedEntities = (opt.showMaskedEntities !== undefined) ? opt.showMaskedEntities : false;
 var showMaskedTiles = (opt.showMaskedTiles !== undefined) ? opt.showMaskedTiles : true;


 if (! (showVisibleEntities || showVisibleTiles || showMaskedEntities || showMaskedTiles)) { return; }

 var dims = Game.util.getDisplayDim(display);
 var xStart = camX-Math.round(dims.w/2);
 var yStart = camY-Math.round(dims.h/2);
 for (var x = 0; x < dims.w; x++) {
   for (var y = 0; y < dims.h; y++) {
     var mapPos = {x:x+xStart,y:y+yStart};
     var mapCoord = mapPos.x+','+mapPos.y;

     if (! ((checkCellsVisible && visibleCells[mapCoord]) || (checkCellsMasked && maskedCells[mapCoord]))) {
       var tile = this.getTile(mapPos);
       if(tile.getName().startsWith("bg")) {
         tile.draw(display,x,y);
       } else {
         if(tile.getName() != "blackDoor") {
           tile.draw(display,x,y,true);
         }
         else if(x % 13 === 9 || x % 13 === 8) {
           Game.Tile.blackWallVertiTile.draw(display,x,y,true);
         } else {
           Game.Tile.blackWallHoriTile.draw(display,x,y,true);
         }
       }
       continue;
     }

     var tile = this.getTile(mapPos);
     if (tile.getName() == 'nullTile') {
       tile = Game.Tile.wallTile;
     }
     if (showVisibleTiles && visibleCells[mapCoord]) {
       tile.draw(display,x,y);
     } else if (showMaskedTiles && maskedCells[mapCoord]) {
       tile.draw(display,x,y,true);
     }

     var ent = this.getEntity(mapPos);
     if (ent) {
       if (showVisibleEntities && visibleCells[mapCoord]) {
         ent.draw(display,x,y);
       } else if (showMaskedEntities && maskedCells[mapCoord]) {
         ent.draw(display,x,y,true);
       }
     }
   }
 }
};

Game.Map.prototype.getRandomLocation = function(filter_func) {
  if (filter_func === undefined) {
    filter_func = function(tile) { return true; };
  }
  var tX,tY,t;
  do {
    tX = Game.util.randomInt(0,this.attr._width - 1);
    tY = Game.util.randomInt(0,this.attr._height - 1);
    t = this.getTile(tX,tY);
  } while (! filter_func(t));
  return {x:tX,y:tY};
};

Game.Map.prototype.getRandomWalkableLocation = function() {
  return this.getRandomLocation(function(t){ return t.isWalkable(); });
};

Game.Map.prototype.toJSON = function () {
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
};

Game.Map.prototype.fromJSON = function (json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
};
