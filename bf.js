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
tape.prototype.get = function(){
    this.allocSpaceTo(this.cursor);
    return this.content[this.cursor];
};
tape.prototype.set = function(ct){
    if(this.cursor == -1){
        this.cursor = 0;
        this.allocSpaceTo(this.cursor);
    }
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

function machine(pTextarea){
    this.programTextarea = pTextarea;
};
machine.prototype.selectChar = function(index){
    var ele = this.programTextarea;
    ele.setSelectionRange(index, index+1);
};
machine.prototype.run = function(tap, onStop){
    if(this.programTextarea.readOnly){
        alert("A program is alerady running.");
        return;
    }
    this.tap = tap;
    this.csip = 0; // This is the **NEXT** char to do with!
    this.program = this.programTextarea.value;
    if(this.program.length == 0){
        onStop();
        return;
    }
    this.programTextarea.readOnly = true;
    var thi = this;
    var cin = setInterval(function(){
        if(thi.csip >= thi.program.length){
            clearInterval(cin);
            onStop();
            thi.programTextarea.readOnly = false;
            return;
        }
        thi.nextStep();
    }, 1000/this.program.length);
};
machine.prototype.nextStep = function(){
    var ch = this.program.charAt(this.csip);
    this.csip++;
    switch(ch){
        case "<":
            this.tap.move(-1);
            break;
        case ">":
            this.tap.move(1);
            break;
        case "+":
            this.tap.set(this.tap.get()+1);
            break;
        case "-":
            this.tap.set(this.tap.get()-1);
            break;
    }
    this.selectChar(this.csip);
};

function runBf(){
    var tap = new tape(document.getElementById('tape'));
    var mc = new machine(document.getElementById('pgr'));
    document.getElementById('run').disabled = true;
    mc.run(tap,function(){
        document.getElementById('run').disabled = false;
    });
}

window.addEventListener("load", function(){
    document.getElementById('run').addEventListener("click", runBf);
});
