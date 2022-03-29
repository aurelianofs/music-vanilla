;(function(){

/* Helper Functions */
var xFrom = function(arr, i, dist){
    var distFrom0 = i + dist;
    bId = distFrom0 % arr.length;
    bId = bId < 0 ? arr.length + bId : bId;
    return arr[bId];
}

/*-------*/
/* CHORD */
/*-------*/
class Chord {

  constructor(fundamental, structure){
    this.fundamental = fundamental[0];
    this.fundamentalAlt = !fundamental[1] ? 0 : fundamental[1] === 'b' ? -1 : 1;
    this.structure = structure;
    this.build();
  }

  build(){
    this.complete = [];
    var chord = chords[this.structure];
    var scaleAlterations = alterationsByScale[this.fundamental];
    for (var i = 0; i < 7; i++) {
      if(chord[i] !== null){
        var key = xFrom(keys, keys.indexOf(this.fundamental), i*2);
        var alt = scaleAlterations[i] + chord[i] + this.fundamentalAlt;
        alt = alterations[alt];
        this.complete.push({key: key, alt: alt});
      }
    }
  }

  random(w7){
    w7 = w7 ? 0 : 1;
    var noteKey = Math.floor( Math.random() * (this.complete.length - w7));
    var note = this.complete[noteKey];
    return note;
  }
}

/*--------*/
/* MUSICA */
/*--------*/
var VF = Vex.Flow;

var durationsArr = {1: '8', 2: 'q', 3: 'qd', 4: 'h', 6:'hd', 8:'w'};

var keys = ['a','b','c','d','e','f','g'];

var alterationsByScale = {
  'f': [0,0,0,0,0,-1,0],
  'c': [0,0,0,0,0,0,0],
  'g': [0,0,0,1,0,0,0],
  'd': [0,1,0,1,0,0,0],
  'a': [0,1,0,1,0,0,1],
  'e': [0,1,0,1,1,0,1],
  'b': [0,1,1,1,1,0,1],
};

var chords = {
  M: [0,0,0,null,null,null,null],
  m: [0,-1,0,null,null,null,null],
  '7': [0,0,0,-1,null,null,null],
  M7: [0,0,0,0,null,null,null],
  m7: [0,-1,0,-1,null,null,null],
  mM7: [0,-1,0,0,null,null,null],
  '9': [0,0,0,0,0,null,null],
  'm9': [0,-1,0,0,0,null,null],
  '#11': [0,0,0,0,0,1,null],
  'sus2': [0,null,0,0,0,null,null],
};

var alterations = {
  '-2': 'bb',
  '-1': 'b',
  '0': null,
  '1': '#',
  '2': '##'
};

class Musica {

  constructor(options){
    this.container = document.getElementById(options.container);
    this.scale = keys.indexOf(options.scale);
    this.options = options;
    this.progression = options.progression;

    this.build();
  }

  refresh(){
    this.container.innerHTML = '';
    this.build();
  }

  build(){
    this.renderer = new VF.Renderer(this.container, VF.Renderer.Backends.SVG);
    this.width = this.container.offsetWidth;
    this.renderer.resize(this.width, 100);
    this.context = this.renderer.getContext();
    this.staves = [];

    this.fillSheet();
  }

  measureDivision(measureLength) {
    var measure = [measureLength];

    function divide(arr, pos){
      if(pos < arr.length) {
        var val = arr[pos];
        if(val > 1 && Math.floor(Math.random() * val)) {
          arr.splice(pos, 1, val/2, val/2);
          return divide(arr, pos);
        } else {
          return divide(arr, pos+1);
        }
      } else {
        return arr;
      }
    }

    return divide(measure, 0);
  }

  getMeasure(chord) {
    var beatDurations = this.measureDivision(8);
    var self = this;

    if (!this.beams) this.beams = [];

    var notes = [];
    var beam = [];
    chord = chord.split(':');
    chord = new Chord(chord[0],chord[1]);
    beatDurations.forEach(function(d, i){
      var base = chord.random(i > 3);
      var note = new VF.StaveNote({ keys: [base.key+'/4'], duration: durationsArr[d] });
      //note = (duration === 3) || (duration === 5) ? note.addDotToAll() : note;
      if(base.alt) {
        note = note.addAccidental(0, new VF.Accidental(base.alt));
      }

      notes.push(note);
    });

    return notes;
  }

  addStave(){
    var newStaveTop = this.staves.length * 100;
    var stave = new VF.Stave(0, newStaveTop, this.width - 1);

    stave.addClef('treble');
    if(!this.staves.length) {
      stave.addTimeSignature('4/4');
      stave.addKeySignature(this.options.scale);
    }
    stave.setContext(this.context).draw();
    this.renderer.resize(this.width, newStaveTop + 100);
    this.staves.push(stave);

    return stave;
  }

  fillSheet() {
    this.totalBeats = 32;
    var self = this;
    var currStave = 0;
    var melody = [];
    var beatsCount = 0;
    var firstBar = true;

    for(var i = 0; this.totalBeats > i; i++) {
      var chord = this.progression[i % this.progression.length];
      var bar = this.getMeasure(chord);
      var clefOffset = currStave ? 70 : 100;

      if (this.width > ((melody.length + bar.length) * 30) + clefOffset + 30) {
        beatsCount += 4;
        (!firstBar) ? melody.push(new Vex.Flow.BarNote(1)) : firstBar = false;
        melody = melody.concat(bar);
      } else {
        i--;
        this.addStave();
        var voice = new VF.Voice({num_beats: beatsCount,  beat_value: 4});
        voice.addTickables(melody);
        var staveSpace = this.width - clefOffset;
        var formatter = new VF.Formatter().joinVoices([voice]).format([voice], staveSpace);

        // Render voice
        var beams = VF.Beam.generateBeams(melody);
        voice.draw(this.context, this.staves[currStave]);
        beams.forEach(function(b) {b.setContext(self.context).draw()});
        currStave++;
        firstBar = true;
        beatsCount = 0;
        melody = [];
      }
    }

    if(beatsCount){
      this.addStave();
      var voice = new VF.Voice({num_beats: beatsCount,  beat_value: 4});
      voice.addTickables(melody);
      var formatter = new VF.Formatter().joinVoices([voice]).format([voice], melody.length * 30);

      // Render voice
      var beams = VF.Beam.generateBeams(melody);
      voice.draw(this.context, this.staves[currStave]);
      beams.forEach(function(b) {b.setContext(self.context).draw()});
    }
  }
}

window.Musica = Musica;

})();
