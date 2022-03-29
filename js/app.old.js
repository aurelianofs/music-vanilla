console.log(VF);
Array.prototype.xFrom = function(i, dist){
    var distFrom0 = i + dist;
    bId = distFrom0 % this.length;
    bId = bId < 0 ? this.length + bId : bId;
    return this[bId];
}

var VF = Vex.Flow;

var keys = ['a','b','c','d','e','f','g'];

var durationsArr = {1: '8', 2: 'q', 3: 'qd', 4: 'h', 6:'hd', 8:'w'};

var defaultOptions = {
  container: 'sheet',
  length: 16,
  beat: 4,
  scale: 'c',
};

var chords = {
  M: [0,0,0,null,null,null,null],
  m: [0,-1,0,null,null,null,null],
  '7': [0,0,0,-1,null,null,null],
  M7: [0,0,0,0,null,null,null],
  m7: [0,-1,0,-1,null,null,null],
  mM7: [0,-1,0,0,null,null,null],
  '9': [0,0,0,0,0,null,null],
};

var progression = ['c:M7', 'c:7', 'f:M7', 'f:m7', 'c:M7', 'a:7', 'd:m7', 'g:7'];

var alterationsByScale = {
  'f': [0,0,0,0,0,-1,0],
  'c': [0,0,0,0,0,0,0],
  'g': [0,0,0,1,0,0,0],
  'd': [0,1,0,1,0,0,0],
  'a': [0,1,0,1,0,0,1],
  'e': [0,1,0,1,1,0,1],
  'b': [0,1,1,1,1,0,1],
};

var alterations = {
  '-2': 'bb',
  '-1': 'b',
  '0': null,
  '1': '#',
  '2': '##'
}

var metronome_s = new Audio('sounds/metronome_s.mp3');
var metronome_w = new Audio('sounds/metronome_w.mp3');
var baseSounds = {
  a: new Audio('sounds/a.mp3'),
  c: new Audio('sounds/c.mp3'),
  d: new Audio('sounds/d.mp3'),
  f: new Audio('sounds/f.mp3'),
  g: new Audio('sounds/g.mp3'),
}

var metronomeToggle = document.getElementById('metronome-toggle');

var playing = false,
metronome,
basePlay;

metronomeToggle.addEventListener('click', function(){
  if (playing) {
    clearInterval(metronome);
    clearInterval(basePlay);
    for (var note in baseSounds) {
      baseSounds[note].pause();
      baseSounds[note].currentTime = 0;
    }
  } else {
    var intervalTime = document.getElementById('metronome-time').value;
    metronome = setInterval(function(){
      metronome_w.play();
    }, intervalTime);

    var baseCurrent = 0;
    var basePrev;
    basePlay = setInterval(function(){
      if (basePrev) {
        baseSounds[basePrev].pause();
        baseSounds[basePrev].currentTime = 0;
      }

      var note = progression.xFrom(0,baseCurrent).slice(0,1);
      baseSounds[note].play();
      basePrev = note;
      baseCurrent++;
    }, intervalTime*4);
  }
  playing = !playing;
});

function Chord (fundamental, structure){
  this.fundamental = fundamental;
  this.structure = structure;
  this.build();
}

Chord.prototype.build = function(){
  this.complete = [];
  var chord = chords[this.structure];
  var scaleAlterations = alterationsByScale[this.fundamental];
  for (var i = 0; i < 7; i++) {
    if(chord[i] !== null){
      var key = keys.xFrom(keys.indexOf(this.fundamental), i*2);
      var alt = scaleAlterations[i] + chord[i];
      alt = alterations[alt];
      this.complete.push({key: key, alt: alt});
    }
  }
};

Chord.prototype.random = function(w7){
  w7 = w7 ? 0 : 1;
  var noteKey = Math.floor( Math.random() * (this.complete.length - w7));
  var note = this.complete[noteKey];
  return note;
};

function App(args) {
  this.init(args);
}

App.prototype.init = function(options){
  this.container = document.getElementById(options.container);
  this.renderer = new VF.Renderer(this.container, VF.Renderer.Backends.SVG);
  this.width = this.container.offsetWidth;
  this.renderer.resize(this.width, 100);
  this.context = this.renderer.getContext();
  this.staves = [];
  this.scale = keys.indexOf(options.scale);

  this.options = options;

  this.fillSheet();
};

// App.prototype.getNote = function(chord) {
//   var note = chord.random();
//   return note;
// };


App.prototype.measureDivision = function(measureLength) {
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
};

App.prototype.getMeasure = function(chord) {
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
};

App.prototype.addStave = function(){
  var newStaveTop = this.staves.length * 100;
  var stave = new VF.Stave(0, newStaveTop, this.width - 1);

  stave.addClef('treble');
  if(!this.staves.length) stave.addTimeSignature('4/4');
  stave.setContext(this.context).draw();
  this.renderer.resize(this.width, newStaveTop + 100);
  this.staves.push(stave);

  return stave;
};

App.prototype.fillSheet = function() {
  this.totalBeats = 32;
  var self = this;
  var currStave = 0;
  var melody = [];
  var beatsCount = 0;
  var firstBar = true;

  for(var i = 0; this.totalBeats > i; i++) {
    var chord = progression[i % progression.length];
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
};

window.appInstance = new App(defaultOptions);
