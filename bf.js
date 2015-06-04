// BrainFuck Tape
// Copyright Wtm <micromaomao@gmail.com>
//           Sunbread <xh3061895@gmail.com>
// MIT Licensed. See LICENSE for more info.
window.alert = function(ale){
    var dI = document.createElement('div');
    dI.className = "dh-alert";
    dI.textContent = ale;
    var clo = document.createElement('div');
    clo.className = "dh-alert-close";
    clo.innerHTML = "Close";
    dI.appendChild(clo);
    document.body.appendChild(dI);
    var dB = document.createElement('div');
    dB.className = "dh-alert-bg";
    document.body.appendChild(dB);
    clo.addEventListener('click', function(){
        dI.remove();
        dB.remove();
    });
};

function tape(element){
    this.ele = element;
    element.innerHTML = "";
    this.cursor = -1;
    this.content = [];
    // DOMElements of tape
    this.iele = [];
    // The top tape block alloced
    this.upper = -1;
}
tape.prototype.move = function(count){
    // The place to move on
    var mvbPos = this.cursor + count;
    if(mvbPos < 0){
        // Entire tape move right.
        this.allocSpaceTo(this.upper - mvbPos);
        for(var i = 0; i < -mvbPos; i ++)
            this.content.splice(0, 0, 0);
        this.content.splice(this.content.length - 1, -mvbPos);
        for(var it = 0; it <= this.upper; it ++)
            this.drawItem(it);
        this.cursor = 0;
        this.rehiLight();
        return;
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
        this.upper = mvbPos;
    }
};
tape.prototype.drawItem = function(it){
    var ct = this.content[it];
    var lt = this.iele[it];
    if(lt){
        lt.innerHTML = ct;
        var clt = String.fromCharCode(ct);
        // If it is a normal ASCII char, show it!
        if(clt.match(/^[\u0020-\u007e\u0080\u0082-\u008c\u008e\u0091-\u00ff]$/)){
            var cha = document.createElement('div');
            cha.textContent = clt;
            cha.className = "bf-tape-item-cha";
            lt.appendChild(cha);
        }
    }else{
        this.allocSpaceTo(it);
    }
};
tape.prototype.get = function(){
    // Is tape init?
    if(this.cursor == -1){
        this.cursor = 0;
        this.allocSpaceTo(this.cursor);
    }
    return this.content[this.cursor];
};
tape.prototype.set = function(ct){
    // Is tape init?
    if(this.cursor == -1){
        this.cursor = 0;
        this.allocSpaceTo(this.cursor);
    }
    this.content[this.cursor] = ct;
    // Don't forget to redraw it.
    this.drawItem(this.cursor);
};
tape.prototype.rehiLight = function(){
    if(this._lastHi !== undefined){
        this.iele[this._lastHi].className = "bf-tape-item";
    }
    this.iele[this.cursor].className = "bf-tape-item bf-tape-item-hi";
    this._lastHi = this.cursor;
};

// Textarea of program, Textarea of input, Textarea of output.
function machine(pTextarea, iA, oA){
    this.programTextarea = pTextarea;
    this.iA = iA;
    this.oA = oA;
    // The Interrupt vector table for Brainfuck function
    this.funtable = [];
    this.stack = [];
};
// It support IE and chrome. Other not tested.
machine.prototype.selectChar = function(index){
    var ele = this.programTextarea;
    ele.setSelectionRange(index, index+1);
};
machine.prototype.run = function(tap, doHyper, onStop){
    if(this.programTextarea.readOnly){
        alert("A program is alerady running.");
        return;
    }
    this.oA.value = "";
    this.tap = tap;
    // This is the **NEXT** char to do with!
    this.csip = 0;
    this.program = this.programTextarea.value;
    if(this.program.length == 0){
        onStop();
        return;
    }
    var zlc = this.program.match(/[\[\]\+\-\.,<>]/g).length;
    var mtl = this.program.match(/\[/g);
    var mtr = this.program.match(/\]/g);
    // Precheck
    if((mtl?mtl.length:0) != (mtr?mtr.length:0)){
        alert("[ and ] can't match.");
        onStop();
        return;
    }
    this.programTextarea.readOnly = true;
    this.oA.readOnly = true;
    var thi = this;
    var cin = setInterval(function(){
        for(var i = 0; i < (doHyper?10000:1); i++){
            if(thi.csip >= thi.program.length){
                clearInterval(cin);
                onStop();
                thi.programTextarea.readOnly = false;
                thi.oA.readOnly = false;
                return;
            }
            thi.nextStep();
        }
    }, doHyper?1:Math.min(3000/zlc, 600));
};
// Run a command and set csip to the next command.
machine.prototype.nextStep = function(){
    var ch = this.program.charAt(this.csip);
    var izl = this.csip;
    this.csip++;
    var thi = this;
    function foundMatch(signP, signM, index, dir){
        var ci = 0;
        if(thi.program.charAt(index) != signP){
            return undefined;
        }
        var ni = index;
        while(dir?ni<thi.program.length:ni>=0){
            var ct = thi.program.charAt(ni);
            if(ct == signP){
                ci++;
            }else if(ct == signM){
                ci--;
            }
            if(ci == 0){
                return ni;
            }
            ni += (dir?1:-1);
        }
        return undefined;
    };
    switch(ch){
        case "<":
            this.tap.move(-1);
            break;
        case ">":
            this.tap.move(1);
            break;
        case "+":
            var tg = this.tap.get();
            // Value overflow.
            if(tg+1 > 255)
                this.tap.set(0);
            else
                this.tap.set(tg+1);
            break;
        case "-":
            var tg = this.tap.get();
            // Value overflow.
            if(tg-1 < 0)
                this.tap.set(255);
            else
                this.tap.set(tg-1);
            break;
        case ".":
            this.stdout(String.fromCharCode(this.tap.get()));
            break;
        case ",":
            var ch = this.getchar();
            if(ch === undefined){
                this.csip = izl;
                this.iA.select();
                return; 
            }
            var charcode = ch.charCodeAt(0);
            while(charcode > 255){
                charcode-=256;
            }
            this.tap.set(charcode);
            break;
        case "[":
            if(this.tap.get() == 0){
                var mt = foundMatch("[", "]", izl, true);
                if(mt === undefined){
                    alert("[ and ] can't match.");
                    break;
                }
                this.csip = mt + 1;
            }
            break;
        case "]":
            if(this.tap.get() != 0){
                var mt = foundMatch("]", "[", izl, false);
                if(mt === undefined){
                    alert("[ and ] can't match.");
                    break;
                }
                this.csip = mt + 1;
            }
            break;
        case "(":
            var mt = foundMatch("(", ")", izl, true);
            if(mt === undefined){
                alert("In this mode, ( and ) is used for function define. See commands manual for more info.");
                break;
            }
            this.funtable[this.program.charAt(izl+1)] = izl+2;
            this.csip = mt + 1;
            break;
        case ")":
            if(this.stack.length > 0){
                this.csip = this.stack.pop()+1;
            }else{
                // End main function!
                this.csip = this.program.length;
            }
            break;
        default:
            if(this.funtable[ch]){
                // csip push stack, jump to function
                this.stack.push(izl);
                if(this.stack.length > 65535){
                    alert("OMG! Stack overflowed! In order not to crash your browser, we'll stop your program now.");
                    this.csip = this.program.length;
                    return;
                }
                this.csip = this.funtable[ch];
            }
            this.nextStep();
            return;
    }
    this.selectChar(this.csip);
};
machine.prototype.stdout = function(out){
    this.oA.value += out;
};
machine.prototype.getchar = function(){
    if(this.iA.value.length == 0){
        return undefined;
    }
    var ch = this.iA.value.substr(0,1);
    this.iA.value = this.iA.value.substr(1);
    return ch;
};
machine.prototype.stop = function(){
    this.csip = this.program.length;
}

function runBf(){
    var tap = new tape(document.getElementById('tape'));
    var mc = new machine(document.getElementById('pgr'), document.getElementById('bfipt'), document.getElementById('bfout'));
    document.getElementById('run').disabled = true;
    document.getElementById('stop').disabled = false;
    var overt = false;
    var doHyper = document.getElementById('fast').checked;
    mc.run(tap,doHyper,function(){
        overt = true;
        document.getElementById('run').disabled = false;
        document.getElementById('stop').disabled = true;
    });
    function fnc(){
        document.getElementById('stop').removeEventListener('click', fnc);
        if(overt){
            return;
        }
        mc.stop();
        overt = true;
        document.getElementById('run').disabled = false;
        document.getElementById('stop').disabled = true;
    };
    document.getElementById('stop').addEventListener('click', fnc);
}

window.addEventListener("load", function(){
    document.getElementById('run').addEventListener("click", runBf);
    var request = new XMLHttpRequest();
    request.open('GET', 'example.bf', true);
    request.onload = function() {
        if (request.status == 200) {
            document.getElementById('pgr').value = request.responseText;
        }
    };
    request.onerror = function() {
    };
    request.send();
});

