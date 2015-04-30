function tape(element){
    this.ele = element;
    element.innerHTML = "";
    this.cursor = 0;
    this.content = [];
    this.iele = [];
    this.upper = -1;
}
tape.prototype.move = function(count){
    var mvbPos = this.cursor + count;
    if(mvbPos < 0){
        mvbPos = 0;
    }
    if(this.upper < mvbPos){
        this.allocSpaceTo(mvbPos);
    }
    this.cursor = mvbPos;
    this.rehiLight();
};
tape.prototype.allocSpaceTo = function(mvbPos){
    if(this.upper < mvbPos){
        for (var alc = this.upper + 1; alc <= mvbPos; alc++){
            this.content[alc] = 0;
            var iel = document.createElement('div');
            iel.className = "bf-tape-item";
            this.ele.appendChild(iel);
            this.iele[alc] = iel;
            this.drawItem(alc);
        }
    }
    this.upper = mvbPos;
};
tape.prototype.drawItem = function(it){
    var ct = this.content[it];
    var lt = this.iele[it];
    if(lt){
        lt.innerHTML = ct;
    }else{
        this.allocSpaceTo(it);
    }
};
tape.prototype.set = function(ct){
    this.content[this.cursor] = ct;
    this.drawItem(this.cursor);
};
tape.prototype.rehiLight = function(){
    if(this._lastHi !== undefined){
        this.iele[this._lastHi].className = "bf-tape-item";
    }
    this.iele[this.cursor].className = "bf-tape-item bf-tape-item-hi";
    this._lastHi = this.cursor;
};

function runBf(){
    var tap = new tape(document.getElementById('tape'));
}

window.addEventListener("load", function(){
    document.getElementById('run').addEventListener("click", runBf);
});
